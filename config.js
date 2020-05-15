module.exports = {
    hiveUrl: 'https://anyx.io',
    hiveAlts: ['https://api.hive.blog', 'https://api.pharesim.me', 'https://rpc.ausbit.dev',
        'https://api.hivekings.com', 'https://api.openhive.network'],
    steemUrl: 'https://api.justyy.com',
    // steemUrl: 'https://steemd.minnowsupportproject.org',
    // steemUrl: 'https://api.steemit.com',
    hsName: 'gba-richmond',
    activeWif: process.env.activeWif || '5JtgE62L5LjZA4fn4H3F1cnzJyysYqWA1EN5nhMkSQWJyUFqQJU',
    tokens: ['PLAY'],
    token: {
        PLAY: { symbol: 'PLAY', name: 'GBA Play Token', decimals: 2, address: '0xf2E99e3a23741449fA942705F4D504b6a099be8b' },
        REWARD: { symbol: 'REWARD', name: 'GBA Reward Token', decimals: 6, address: '' },
        UTILETH: { symbol: 'UTILETH', name: 'ETH Utility Token', decimals: 18, address: '' }
    },
    addrGBBP: 'http://etht5zt7j-dns-reg1.eastus2.cloudapp.azure.com:8540',
    wsGBBP: 'ws://etht5zt7j-dns-reg1-0.eastus2.cloudapp.azure.com:8547',
    bothLocal: 'ws://localhost:8545',
    addrCurr: '',
    address: process.env.address || '0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e',
    privateKey: process.env.privateKey || 'b0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773',
    dbConn: process.env.dbConn ? JSON.parse(process.env.dbConn) : {
        "server": "gbaorg.database.windows.net",
        "options": { "encrypt": true, "database": "dbGBBP-dev", "trustServerCertificate": true },
        "authentication": { "type": "default", "options": { "userName": "gba-dev", "password": "vedP455$" } }
    },
};
//# sourceMappingURL=config.js.map