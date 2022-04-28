import untar from "js-untar";
import { NFTStorage } from "nft.storage/dist/bundle.esm.min.js";
const CID_RE = /Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,}/m;

import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";

const API_KEY = process.env.VUE_APP_NFT_STORAGE_API_KEY;

const client = new NFTStorage({
  token: API_KEY,
});

console.log(API_KEY, "keu");

export async function loadAllNFTs(solanaInstance, walletInstance) {
  try {
    console.log(solanaInstance, walletInstance, "loadAllNFTs");
    const provider = walletInstance;
    let ownerToken = provider.publicKey.toString();
    let nfts = await getParsedNftAccountsByOwner({
      publicAddress: ownerToken,
      connection: solanaInstance,
      serialization: true,
    });
    console.log("nfts", nfts);
    return nfts;
  } catch (error) {
    console.log(error);
  }
}

async function pushImageToIpfs(ipfsInstance, objectURL) {
  let cidV1 = "";
  try {

    // string property `name` identifying the asset is required
    // at validateERC1155 --- nft STORAGE
    let cid = "";
    let data = null;
    await fetch(objectURL)
      .then(function(res){return res.arrayBuffer();})
      .then(function(buf){ data = new File([buf], "nft.jpg", {type: "image/*"});});
    console.log(data, "data 1");
    console.log(data, "data 2");
    console.log(cid, "cid pushImageToIpfs");
    cidV1 = data;
  } catch(err) {
    console.log(err, "err pushImageToIpfs");
  }

  return cidV1;
}

async function pushObjectToIpfs(ipfsInstance, object) {
  let cid = null;
  try {
    console.log(object, "object");
    cid = await client.store(object);
    console.log(cid, "cid");
  } catch(err) {
    console.log(err, "err pushObjectToIpfs");
  }
  return cid;
}

export async function deployNFTtoIPFS(ipfsInstance, meta) {
  let imageBlob = await pushImageToIpfs(ipfsInstance, meta.image);
  // let meta = JSON.parse(JSON.stringify(oldMeta));
  // meta.animation_url = `ipfs://${imageCID}`;
  // const cid = await client.store(imageBlob);
  console.log(imageBlob, meta, "deployNFTtoIPFS");
  let uriJSON = {
    ...meta,
    image: imageBlob,
    properties: {
      ...meta.properties,
      files: [
        {
          uri: imageBlob,
          type: "image/*"
        }
      ]
    }
  };
  const metaDataCID = await pushObjectToIpfs(ipfsInstance, uriJSON);
  console.log(metaDataCID, "metaDataCID");
  return `https://${metaDataCID.ipnft}.ipfs.dweb.link/metadata.json`;
}

export async function getImageForTokenByURI(ipfsInstance, imageAddress) {
  let image;
  if (imageAddress) {
    if (imageAddress.startsWith("ipfs") || imageAddress.startsWith("https://ipfs"))  {
      let cid = CID_RE.exec(imageAddress)?.[0];
      let localImageURL = await getDataFromIPFS(ipfsInstance, cid);
      image = localImageURL;
    } else {
      image = imageAddress;
    }
  }
  return image;
}

async function getDataFromIPFS(ipfsInstance, cid) {
  let tokenData = null;
  try {
    if (cid === "" || cid === null || cid === undefined) {
      return;
    }
    let content = [];
    for await (const buff of ipfsInstance.cat(cid, { timeout: 6000 })) {
      if (buff) {
        content.push(buff);
      }
    }
    tokenData = Buffer.concat(content).toString();
    tokenData = JSON.parse(tokenData);
    
    if (tokenData.image.startsWith("ipfs") || tokenData.image.startsWith("https://ipfs"))  {
      let cid = CID_RE.exec(tokenData.image)?.[0];
      let data = {
        ...tokenData,
        image: null,
      };

      data.image = await getImageFromIpfs(ipfsInstance, cid);

      return data;
    } else {
      return tokenData;
    }
  } catch (e) {
    console.log(e, `getImageFromIpfs ERROR ${cid}`);
  }
}

async function getImageFromIpfs(ipfsInstance, cid) {
  let blob = null;
  try {
    blob = await loadFileFromIPFS(ipfsInstance, cid, 6000);
  } catch (e) {
    console.log(e, `getImageFromIpfs ERROR ${cid}`);
  }
  return blob ? URL.createObjectURL(blob) : null;
}

async function loadFileFromIPFS(ipfs, cid, timeout) {
  if (cid === "" || cid === null || cid === undefined) {
    return;
  }
  let content = [];
  for await (const buff of ipfs.get(cid, {timeout})) {
    if (buff) {
      content.push(buff);
    }
  }
  let archivedBlob = new Blob(content, {type: "application/x-tar"});
  let archiveArrayBuffer = await archivedBlob.arrayBuffer();
  let archive = (await untar(archiveArrayBuffer))?.[0];

  return archive.blob;
}