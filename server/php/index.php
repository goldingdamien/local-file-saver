<?php
/*
Should return "" if no errors.
*/
session_start();

// TODO: JSON
$logPath = "logs/";
$path = "files/";
$key = "userFiles";
$timeout = 60;//seconds
$debug = false;

//Debugging
//print_r($_FILES);
//print_r($_POST);

//Handle max limit
if(empty($_FILES) && empty($_POST) && isset($_SERVER['REQUEST_METHOD']) && strtolower($_SERVER['REQUEST_METHOD']) == 'post'){
  $postMax = ini_get('post_max_size');
  handleError("ERROR. MAX POST SIZE: " . $postMax);
  return handleEnd(false);
}

$meta = array(
  "sendCount" => $_POST["sendCount"],
  "clientKey" => $_POST["clientKey"]
);
saveFiles($_FILES[$key], $path, $meta);

/**
* @param array $filesArr
* @param string $path
* @param array|object $meta
 */
function saveFiles($filesArr, $path, $meta){
  
  //Folder session(Handle bad sesson also)
  if(isBadSession($_SESSION, $meta)){
    session_unset();
    $_SESSION["sendCount"] = $meta["sendCount"];
    $_SESSION["dirName"] = getCurrentTime();
    $_SESSION["created"] = date("Y-m-d_H-i-s");
    $_SESSION["clientKey"] = $meta["clientKey"];
    $_SESSION["completeCount"] = 0;
  }
  
  //Folder
  $dirName = $_SESSION["dirName"];
  $dirPath = $path . $dirName;
  if(!file_exists($dirPath)){
    mkdir($dirPath, 0700);
  }
  
  $length = count($filesArr['name']);
  for($i=0; $i<$length; $i++){
    $url = $dirPath . "/" . basename( $filesArr['name'][$i] );
    $file = $filesArr['tmp_name'][$i];
    
    saveFile($file, $url);
  }
  
  if($_SESSION["completeCount"] >= $_SESSION["sendCount"]){
    session_unset();
  }else{
    $_SESSION["completeCount"]++;
  }
}

/**
* @param File $file
* @param string $url
 */
function saveFile($file, $url){
  if(file_exists($url)){handleError("File already exists at: " . $url . "\n");}
  move_uploaded_file( $file, $url );
}

/**
* @param any $returnVal
 */
function handleEnd($returnVal){
  die($returnVal);
}

/**
* @return Date
 */
function getCurrentTime(){
  return (date("Y-m-d--H-i-s") . "-" . substr((string)microtime(), 2, 8));
}

/**
* @param array $session
* @param array|object $meta
* @return boolean
 */
function isBadSession($session, $meta){
  $keys = array("dirName", "sendCount", "created", "clientKey", "completeCount");
  for($i=0; $i<count($keys); $i++){
    $key = $keys[$i];
    if( !isset($session[$key]) ){
      debugOutput("Not set: " . $key);
      return true;
    }
  }
  
  if( sessionTimedOut($session["created"]) ){
    debugOutput("Timed out");
    return true;
  }
  
  if($session["clientKey"] !== $meta["clientKey"]){
    debugOutput("Client key differs");
    return true;
  }
  
  return false;
}

/**
* @param Date $date
* @return boolean
 */
function sessionTimedOut($date){
  $time = strtotime($date);
  $now = strtotime( getCurrentTime() );
  
  if( ($now - $time) > $GLOBALS["timeout"] ){
    return true;
  }else{
    return false;
  }
}

/**
* @param string $str
 */
function handleError($str){
  
  //Log file
  $date = getCurrentTime();
  $file = $GLOBALS["logPath"] . $date . ".txt";
  file_put_contents($file, $str);
  
  echo $str;
}

/**
* @param string $str
 */
function debugOutput($str){
  if($GLOBALS["debug"]){
    echo $str;
  }
}

?>