cloud storageの署名付きアップロードを試す

## 構成
- `/client`: reactでファイルをアップロード
- `/server`: 署名付きURLを発行するAPIサーバー goでやったけど何故か動かない

## セットアップ
```bash
gsutil cors set cors.json gs://{バケット名}
```
を実行してCORSポリシーを設定

## 参考
https://cloud.google.com/storage/docs/access-control/signed-urls