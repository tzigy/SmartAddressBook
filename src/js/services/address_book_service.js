import { default as bs58 } from 'bs58';

var AddressBookService = {

    getAllEntries: function (addressBookInstance) {
        return new Promise((resolve, reject) => {
            var meta;
            var addressBookObj = {};
            addressBookObj.entities = [];
            addressBookInstance.then((instance) => {
                meta = instance;
                return meta.getEntries();
            })
            .then((entries) => {
                let entriesList = [];
                for (let index = 0; index < entries.length; index++) {
                    const ipfsAddr = this.getIpfsHashFromBytes32(entries[index]);                
                    entriesList.push(this.makeRequest('GET', "http://localhost:8080/ipfs/" + ipfsAddr));
                }
                return Promise.all(entriesList);
            }).then((entriesList) => {
                
                entriesList.map(entry => {
                    let entryJson = JSON.parse(entry);
                    addressBookObj.entities.push(entryJson);                 
                })                
                resolve(addressBookObj);
            })
                .catch((error) => {
                    console.error(error)
                    reject(error)
                })
        })
    },
    addNewEntity: function(addressBookInstance, entityIpfsAddr, contractAddr){
        return new Promise((resolve, reject) => {
            var meta;            
            addressBookInstance.then((instance) => {
                meta = instance;
                let entityAddr = this.getBytes32FromIpfsHash(entityIpfsAddr);
                let priceToWei = window.web3.toWei(2, 'ether');
                console.log(priceToWei);
                return meta.addEntry.sendTransaction(entityAddr, {from: web3.eth.coinbase, value: priceToWei,to:contractAddr, gas: 470000 });
            })
            .then((entries) => {
                console.log(entries);
            })
                .catch((error) => {
                    console.error(error)
                    reject(error)
                })
        })
    },
    getBytes32FromIpfsHash: function (ipfsAddr) {
        return "0x" + bs58.decode(ipfsAddr).slice(2).toString('hex')
    },
    getIpfsHashFromBytes32: function (bytes32Hex) {
        // Add our default ipfs values for first 2 bytes:
        // function:0x12=sha2, size:0x20=256 bits
        // and cut off leading "0x"
        const hashHex = "1220" + bytes32Hex.slice(2)
        const hashBytes = Buffer.from(hashHex, 'hex');
        const hashStr = bs58.encode(hashBytes)
        return hashStr
    },
    makeRequest: function (method, url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    },

};

module.exports = AddressBookService;