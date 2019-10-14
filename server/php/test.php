<?php

print_r($_SERVER);
exec("ipconfig", $output);
print_r($output);
?>