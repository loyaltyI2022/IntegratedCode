// import fs from 'fs';
// import * as openpgp from 'openpgp';
const fs=require('fs')
const openpgp=require('openpgp')
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');
require('dotenv').config()

async function main() {

  const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

console.log(AZURE_STORAGE_CONNECTION_STRING)

  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw Error("Azure Storage Connection string not found");
  }
  console.log('Azure Blob storage v12 - JavaScript quickstart sample');


  // Create the BlobServiceClient object which will be used to create a container client
  const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
  );

  // Create a unique name for the container
      const containerName = "files"

//       // Get a reference to a container
      const containerClient = blobServiceClient.getContainerClient(containerName);

   const blobName = "gap_uat_profile_extract_2022042001000203.csv.gpg";

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log("\nListing blobs...");

    // List the blob(s) in the container.
    for await (const blob of containerClient.listBlobsFlat()) {
    console.log("\t", blob.name);
    }

    // Get blob content from position 0 to the end
    // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
    // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    console.log("\nDownloaded blob content...");
    (data=await streamToText(downloadBlockBlobResponse.readableStreamBody));
    
    (async() => {
        //read the provided private key from file
        const privateKeyArmored = fs.readFileSync('./Privatekey.asc', 'utf8');
    
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
        console.log("Displaying decrypted data")
        console.log(decrypted.data)
        
    
    })();
    
}

// Convert stream to text
async function streamToText(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
      data += chunk;
    }
    return data;
  }

main()
.then(() => console.log('Done'))
.catch((ex) => console.log(ex.message));