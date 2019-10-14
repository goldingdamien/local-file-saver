var app = {
  connection: {
    maxConcurrentRequests: 1,
    pool: []
  },
  status: {
    sending: false,
    sendingCounts: {
      sent: 0,
      complete: 0,
      failed: 0
    }
  }
}

window.addEventListener("load", onLoad)

function onLoad(){
  var dropArea = document.getElementById("dropArea");
  dropArea.ondragover = dropArea.ondragenter = function(evt) {
    evt.preventDefault();
  }

  dropArea.ondrop = function(evt) {//IE FAILS
    console.log("DROP:")
    console.log(evt)

    document.getElementById("file").files = evt.dataTransfer.files

    evt.preventDefault();
  }

  document.getElementById("form").addEventListener("submit", handleSubmit)

  document.getElementById("form").addEventListener("change", handleFormChange)
}

/**
* @param {Event} evt
 */
function handleFormChange(evt){
  updateSendingProgress()
}

/**
* @param {Event} evt
* @return {false}
 */
function handleSubmit(evt){
  if(evt && evt.preventDefault){
    evt.preventDefault()
  }

  //Submit files separately to avoid memory issues.
  var files = document.getElementById("file").files
  var url = document.getElementById("form").getAttribute("action")
  var param = document.getElementById("file").getAttribute("name")

  var sendCount = files.length
  var clientKey = (new Date()).toUTCString()
  for(var i=0; i<sendCount; i++){
    sendFile(url, param, files[i], sendCount, clientKey)
  }

  return false
}

/**
* @param {string} url
* @param {string} param
* @param {File} file
* @param {number} sendCount
* @param {string} clientKey
 */
function sendFile(url, param, file, sendCount, clientKey){
  console.log(url, param)

  //Data
  var formData = new FormData()
  formData.append(param, file)//Data
  formData.append("sendCount", sendCount)//Status
  formData.append("clientKey", clientKey)

  //Pool
  addToPool(formData, url)
  
  //Status
  app.status.sendingCounts.sent++
  if(!app.status.sending){
    onSendBatchStart()
  }
  updateSendingProgress()
}

function addToPool(data, url){
  app.connection.pool.push({
    data: data,
    url: url
  });
  
  handlePool()
}

function handlePool(){
  var c = app.status.sendingCounts
  var con = app.connection
  var sendingCount = c.sent - (c.complete + c.failed)
  var max = con.maxConcurrentRequests
  var toSendCount = (sendingCount > max) ? max : sendingCount
  
  for(var i=0; i<toSendCount; i++){
    if(con.pool[0]){
      sendData(con.pool[0].data, con.pool[0].url)
      con.pool.shift()
    }
  }
}

/**
* @param {*} data
* @param {string} url
 */
function sendData(data, url){
  var xhr = new XMLHttpRequest()
  xhr.open('post', url, true)
  //xhr.setRequestHeader("Content-Type", "multipart/form-data");
  xhr.send(data)
  
  xhr.onreadystatechange = function(evt) {
    if ( this.readyState == 4 ) {
      handleResponse(xhr)
    }
  }
}

function onSendBatchStart(){
  app.status.sending = true
  document.getElementById("submit").disabled = true
}

/**
* @param {XMLHttpRequest} xhr
 */
function handleResponse(xhr){
  console.log(xhr)

  if(xhr.responseText){
    alert("An error occurred. Please check console.error in JavaScript console for more details.")
    console.error(xhr.responseText)
    app.status.sendingCounts.failed++
  }else{
    console.log("Send success")
    app.status.sendingCounts.complete++
  }
  
  var status = app.status
  var counts = status.sendingCounts
  
  //Next in pool
  handlePool()
  
  //Progress
  updateSendingProgress()
  
  //Complete check
  if(counts.complete + counts.failed === counts.sent){
    var bool = (counts.failed) ? false : true
    onSendBatchEnd(bool)
  }
}

function updateSendingProgress(){
  var el, count, bool, status
  count = document.getElementById("file").files.length
  document.getElementById("fileCount").textContent = count
  
  el = document.getElementById("sendingStatus")
  status = (app.status.sending) ? "○" : "×"
  el.textContent = status
  
  el = document.getElementById("completeCount")
  count = app.status.sendingCounts.complete
  el.textContent = count
  
  el = document.getElementById("failedCount")
  count = app.status.sendingCounts.failed
  el.textContent = count
}

function initializeSendingStatus(){
  app.status.sending = false
  app.status.sendingCounts.complete = 0
  app.status.sendingCounts.failed = 0
  app.status.sendingCounts.sent = 0
}

/**
* @param {boolean} bool
 */
function onSendBatchEnd(bool){
  initializeSendingStatus()
  clearFiles()
  document.getElementById("submit").disabled = false
}

function clearFiles(){
  document.getElementById("file").value = ""
  handleFormChange()
}

/**
* @param {string} url
 */
function displayServerInfo(url){
  var textEl = _getUrlTextElement(url)
  var qrCodeEl = _getQrCodeElement(url)
  
  var el = document.createElement("div")
  el.appendChild(textEl)
  el.appendChild(qrCodeEl)
  
  document.body.appendChild(el)
}

/**
* @param {string} url
* @return {HTMLElement}
 */
function _getUrlTextElement(url){
  var span = document.createElement("span")
  span.style.clear = "both"
  span.style.display = "block"
  span.textContent = "Server started at: " + url
  
  return span
}

// TODO: Below is not implemented yet. If can get correct url from server, show link/qrcode below.

/**
* @param {string} url
* @return {HTMLElement}
 */
function _getQrCodeElement(url){
  //Dependent on: https://github.com/davidshimjs/qrcodejs
  if(!window.QRCode){
    return null
  }
  var el = document.createElement("div")
  el.style.width = "100%"
  var width = 1024//128
  var height = 1024//128
  
  var qrcode = new QRCode(el, {
    text: "text",
    width: width,
    height: height,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  })

  return el
}