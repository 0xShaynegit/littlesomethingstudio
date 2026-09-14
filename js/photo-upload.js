// Resizes and converts an image file to WebP in the browser, shrinking it
// under MAX_BYTES if needed. Runs client-side because doing this in the
// Cloudflare Worker exceeds the Workers CPU time limit.
(function () {
  var MAX_DIMENSION = 1600;
  var MIN_DIMENSION = 400;
  var MAX_BYTES = 200 * 1024;

  function loadBitmap(file) {
    if ('createImageBitmap' in window) return createImageBitmap(file);
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  function drawToBlob(bitmap, width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    return new Promise(function (resolve) {
      canvas.toBlob(resolve, 'image/webp', 0.85);
    });
  }

  async function resizeToWebp(file) {
    var bitmap = await loadBitmap(file);
    var width = bitmap.width || bitmap.naturalWidth;
    var height = bitmap.height || bitmap.naturalHeight;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      var scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    var blob = await drawToBlob(bitmap, width, height);

    while (blob && blob.size > MAX_BYTES && Math.max(width, height) > MIN_DIMENSION) {
      width = Math.round(width * 0.85);
      height = Math.round(height * 0.85);
      blob = await drawToBlob(bitmap, width, height);
    }

    return new File([blob], 'photo.webp', { type: 'image/webp' });
  }

  window.resizeToWebp = resizeToWebp;
})();
