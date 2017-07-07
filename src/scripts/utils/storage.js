import ext from "./ext";

var storageCustom = (ext.storage.sync ? ext.storage.sync : ext.storage.local);

// Get Recorded Data
storageCustom.getDataStored = (callback) => {
  storageCustom.get(function (data) {
    if (typeof(data.detectedVideos) == 'undefined' || data.detectedVideos.length == 0) {
      console.log('getDataStored : No Data already exists, get default empty object.')
      data.detectedVideos = {};
    }
    callback(data.detectedVideos);
  });
}
// Store BPMs in localStorage
storageCustom.storeResultInStorage = (id, bpm) => {
  var save = (data) => {
    data[id] = bpm.toString();
    storageCustom.set({
      detectedVideos: data
    }, function () {
      global.allegro.display.update(data);
      console.log('Sync succeed !');
    });
  }

  storageCustom.getDataStored( function (data) {
    console.log('_storeResultInStorage');
    // Check if already exist
    //if (data.hasOwnProperty(id)) {
      //var result = confirm("You have already a value detected for this track ! (" + data[id] + "). Do you want to erase this ?");
      //if ( ! result) {
      //  console.log('store skipped !');
      //  return;
      //}
    //}
    save(data);
  });
}

storageCustom.removeDataStored = (id) => {
  var save = (data) => {
    storageCustom.set({
      detectedVideos: data
    }, function () {
      console.log('Remove Sync succeed !');
    });
  }

  storageCustom.getDataStored( function (data) {
    console.log(data);
    console.log(id);
    console.log(data[id]);
    delete data[id];
    save(data);
  });
}


module.exports = storageCustom;