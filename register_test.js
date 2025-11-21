const data = { name: 'Auto Tester', email: 'autotest.user+9999@example.com', password: 'DemoPass1', phone: '9123456789' };

fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
.then(async res => {
  console.log('STATUS', res.status);
  try { const json = await res.json(); console.log(JSON.stringify(json, null, 2)); }
  catch(e) { const text = await res.text(); console.log(text); }
})
.catch(err => {
  console.error('FETCH ERROR', err);
});
