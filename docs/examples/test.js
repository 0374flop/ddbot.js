const teeworlds = require('teeworlds');

const client = new teeworlds.Client('45.141.57.22', 8375, 'Towa test');

client.connect();

client.on('message', (msg) => {
    console.log(JSON.stringify(msg, null, 2));
});

client.on('connected', () => {
    console.log('connected');
});

client.on('disconnect', (reason) => {
    console.log(reason);
    client.connect();
});

process.on('SIGINT', () =>{
    client.Disconnect();
    console.log('AAAAAAAAAAAAAAAAAAAAAAAAA');
    process.exit(1);
})