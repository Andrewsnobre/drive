const IPFS = require('ipfs-api');
//const ipfs = new IPFS({host: 'localhost', port: 5001});
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
export default ipfs;