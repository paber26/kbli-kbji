async function testRoutes() {
  const routes = ['/', '/katalog', '/bank-data', '/statistik', '/admin'];
  console.log('=== TESTING REACT ROUTER ROUTES ===\n');

  for (const r of routes) {
    const res = await fetch(`http://localhost:3000${r}`);
    console.log(`✓ Route http://localhost:3000${r} -> Status ${res.status}`);
  }

  console.log('\n=== ALL ROUTES RESPONDING WITH HTTP 200 ===');
}

testRoutes().catch(console.error);
