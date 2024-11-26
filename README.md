# Implemented Apps in This Project

## アプリ１

### 要件

- テキスト入力やレコードタイプ・業種などによる絞り込み
- 取引先新規作成機能
- 論理削除機能
- CSV出力機能

### シナリオ

その１

- 標準機能によるレコード検索では直観的な操作ができない
- レコードタイプ・業種などレコードによる素早い絞り込みが苦手
- 顧客がより直観的に操作やレコードの絞り込み・表示件数の制御が可能

その２

- デモ版を顧客に展開 → 導入したいのでアプリを開発してほしいと依頼
- 実際に開発するが、本来は要件定義・資料作成などを実施

その３

- 追加改修要望
- 各機能は別アプリより実行できるが、作業効率が悪い

## アプリ２

### 要件

- 異なるSalesforce環境に取引先を作成or更新するバッチ処理
- 自動起動のスケジュールバッチ
- ボタン選択時に走る手動起動バッチ

### シナリオ

- A社とB社で異なる領域の担当をしている
- 定期的に手動でデータの同期作業を実施している
- ヒューマンエラーやデータの不一致など発生している
- バッチによって安全かつ正確にデータを同期させたい