import fs from 'fs';
import * as openpgp from 'openpgp';

(async() => {
    //read the provided private key from file
    const privateKeyArmored = fs.readFileSync('./PrivateKey.asc', 'utf8');

    //read the encrypted data from file
    const data = fs.readFileSync('./data/EncryptedFile.gpg', 'utf-8');

    //passphrase for decrypting the private key
    const passphrase = `Loy@ltymtlaccountmatch`;

    //decrypting the key using passphrase
    const privateKey = await openpgp.decryptKey({
        /*the readPrivateKey method is used to convert private key to PrivateKey object and it
        is then passed to the decrypt key function along with passphrase*/
        privateKey: await openpgp.readPrivateKey({
            armoredKey: privateKeyArmored
        }), 
        passphrase: passphrase
    });

    //convert the encrypted data into a Message object
    const message = await openpgp.readMessage({armoredMessage: data});

    //pass the message and decrypted private key as arguments to decrypt the data
    const decrypted = await openpgp.decrypt({
        message: message,
        decryptionKeys: privateKey
    });
    
    //write the decrypted data to a file
    fs.writeFileSync('./data/DecryptedFile.csv', decrypted.data, (err) => {
        if (err)
        console.error(err);
        else
        console.log("Data written successfully");
    });

})();



