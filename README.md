# Test AWS SAM Build Error

## Description

[issuer](https://github.com/aws/aws-sam-cli/issues/7503#issuecomment-2377879095)
Since version 1.124.0 I can no longer build an aws sam template with a lambda function inside in nodejs

### Log on 

```bash
 $ sam build --debug
```

log:
Running workflow 'NodejsNpmBuilder'
2024-09-23 14:17:50,494 | Running NodejsNpmBuilder:NpmPack
2024-09-23 14:17:50,495 | NODEJS packaging file:C:.......aws-dist to C:\Users<userfolder>\AppData\Local\Temp\tmpr_e2iwel
2024-09-23 14:17:50,497 | executing NPM: ['npm.cmd', 'pack', '-q', 'file:C:\...\.aws-dist']
2024-09-23 14:17:52,527 | NODEJS packed to -api-1.4.4.tgz
2024-09-23 14:17:52,528 | NODEJS extracting to C:\Users<userfolder>\AppData\Local\Temp\tmpr_e2iwel\unpacked
2024-09-23 14:17:52,530 | NodejsNpmBuilder:NpmPack raised unhandled exception
Traceback (most recent call last):
File "C:\Program Files\Amazon\AWSSAMCLI\runtime\Lib\site-packages\aws_lambda_builders\workflow.py", line 374, in run
action.execute()
File "C:\Program Files\Amazon\AWSSAMCLI\runtime\Lib\site-packages\aws_lambda_builders\workflows\nodejs_npm\actions.py",
line 68, in execute
extract_tarfile(tarfile_path, self.artifacts_dir)
File "C:\Program Files\Amazon\AWSSAMCLI\runtime\Lib\site-packages\aws_lambda_builders\utils.py", line 230, in
extract_tarfile
with tarfile.open(tarfile_path, "r:*") as tar:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
File "tarfile.py", line 1835, in open
File "tarfile.py", line 1903, in gzopen
File "gzip.py", line 192, in init
FileNotFoundError: [Errno 2] No such file or directory:
'C:\Users\M9A61~1.PET\AppData\Local\Temp\tmpr_e2iwel\livesign-api-1.4.4.tgz'
  
  

## Step to reproduce

```bash
# dependency installation
$ npm install

# watch mode
$ sam build --debug

```

