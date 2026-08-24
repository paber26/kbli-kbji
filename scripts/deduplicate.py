import json
import re
from collections import defaultdict
from difflib import SequenceMatcher

def normalize_str(s):
    if not s:
        return ""
    # Normalize whitespace and lowercase
    s = re.sub(r'\s+', ' ', str(s).strip())
    return s

def deduplicate_cases():
    with open('src/data/fieldCases.json', 'r', encoding='utf-8') as f:
        cases = json.load(f)

    print(f"Total raw cases: {len(cases)}")

    # 1. Group by (KBLI, KBJI)
    grouped_by_pair = defaultdict(list)
    for c in cases:
        kbli = c['mjj']['kbli_code']
        kbji = c['mjj']['kbji_code']
        grouped_by_pair[(kbli, kbji)].append(c)

    consolidated_records = []
    cluster_id = 1

    for (kbli, kbji), group in grouped_by_pair.items():
        if len(group) == 1:
            item = group[0]
            item['sample_count'] = 1
            item['variants'] = []
            consolidated_records.append(item)
            continue

        # Sub-cluster similar items
        sub_clusters = []
        for item in group:
            item_occtle = normalize_str(item['mjj']['occtle']).lower()
            item_occmtd = normalize_str(item['mjj']['occmtd']).lower()
            item_bidang = normalize_str(item['mjj']['bidang']).lower()
            combined = f"{item_occtle} {item_occmtd} {item_bidang}"

            matched_cluster = None
            best_sim = 0

            for sc in sub_clusters:
                rep = sc[0]
                rep_occtle = normalize_str(rep['mjj']['occtle']).lower()
                rep_occmtd = normalize_str(rep['mjj']['occmtd']).lower()
                rep_bidang = normalize_str(rep['mjj']['bidang']).lower()
                rep_combined = f"{rep_occtle} {rep_occmtd} {rep_bidang}"

                # Similarity score
                sim = SequenceMatcher(None, combined, rep_combined).ratio()
                
                # Commodity exact match or high string similarity
                com_sim = SequenceMatcher(None, item_occmtd, rep_occmtd).ratio()
                occ_sim = SequenceMatcher(None, item_occtle, rep_occtle).ratio()

                if sim > 0.50 or (com_sim > 0.70 and occ_sim > 0.40):
                    if sim > best_sim:
                        best_sim = sim
                        matched_cluster = sc

            if matched_cluster is not None:
                matched_cluster.append(item)
            else:
                sub_clusters.append([item])

        # Consolidate each sub-cluster
        for sc in sub_clusters:
            # Pick representative item: choose the clearest/longest or cleanest description
            sc_sorted = sorted(sc, key=lambda x: len(x['mjj']['occtle']) + len(x['mjj']['occmtd']) + len(x['mjj']['bidang']), reverse=True)
            representative = sc_sorted[0]

            # Collect unique variants
            variants = []
            seen_texts = set()
            for x in sc:
                t = f"{normalize_str(x['mjj']['occtle'])} | {normalize_str(x['mjj']['occmtd'])} | {normalize_str(x['mjj']['bidang'])}"
                if t not in seen_texts and t != f"{normalize_str(representative['mjj']['occtle'])} | {normalize_str(representative['mjj']['occmtd'])} | {normalize_str(representative['mjj']['bidang'])}":
                    seen_texts.add(t)
                    variants.append({
                        "occtle": x['mjj']['occtle'],
                        "occmtd": x['mjj']['occmtd'],
                        "bidang": x['mjj']['bidang']
                    })

            merged_record = {
                "id": representative['id'],
                "index": len(consolidated_records) + 1,
                "kode_prov": representative.get('kode_prov', '71'),
                "kode_kab": representative.get('kode_kab', '05'),
                "nama_wilayah": representative.get('nama_wilayah', 'Kabupaten Minahasa Selatan, Sulawesi Utara'),
                "mjj": {
                    "occtle": representative['mjj']['occtle'].strip(),
                    "occmtd": representative['mjj']['occmtd'].strip(),
                    "bidang": representative['mjj']['bidang'].strip(),
                    "kbli_code": representative['mjj']['kbli_code'],
                    "kbli_label": representative['mjj']['kbli_label'],
                    "kbji_code": representative['mjj']['kbji_code'],
                    "kbji_label": representative['mjj']['kbji_label'],
                    "kbli_category": representative['mjj'].get('kbli_category'),
                    "kbji_category": representative['mjj'].get('kbji_category')
                },
                "sjj": representative.get('sjj'),
                "mpk": representative.get('mpk'),
                "sample_count": len(sc),
                "variants": variants,
                "full_text": f"{representative['mjj']['occtle']} {representative['mjj']['occmtd']} {representative['mjj']['bidang']}".strip()
            }
            consolidated_records.append(merged_record)

    print(f"Total consolidated clean records: {len(consolidated_records)}")
    multi_count = sum(1 for r in consolidated_records if r['sample_count'] > 1)
    print(f"Number of consolidated clusters that merged duplicate/similar items: {multi_count}")

    # Re-index IDs cleanly e.g. CASE-001, CASE-002...
    for i, r in enumerate(consolidated_records, 1):
        r['id'] = f"CASE-{str(i).padStart(3, '0')}" if hasattr(str(i), 'padStart') else f"CASE-{str(i).zfill(3)}"
        r['index'] = i

    return consolidated_records

if __name__ == '__main__':
    clean_cases = deduplicate_cases()
    with open('src/data/fieldCases.json', 'w', encoding='utf-8') as f:
        json.dump(clean_cases, f, indent=2, ensure_ascii=False)
    print("Updated src/data/fieldCases.json with consolidated cases!")
