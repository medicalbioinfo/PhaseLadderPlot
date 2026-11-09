<p align="center">
  <img src="assets/PhaseLadderPlot_icon.png" alt="Phase Ladder Plot" width="160">
</p>

# Phase Ladder Plot

**Web 版:** https://medicalbioinfo.github.io/PhaseLadderPlot/

## 概要

PhaseLadderPlot は、phasing 済みの VCF ファイル（PS タグ付きの VCF ファイル）をインプットにして、phase block を染色体上に図示化するツールです。

## 入力ファイル（PS タグ付き VCF）について

一般的なロングリードシーケンス（ONT および PacBio）の解析で出力される VCF ファイルなど、解析途中でフェージング処理を行った VCF ファイルには PS タグが付けられています。

ショートリードの VCF ファイルには PS タグが付けられていませんが、[WhatsHap](https://whatshap.readthedocs.io/) などのフェージングソフトにより PS タグを後から付加することもできます。

- 参照ゲノム: hg38（GRCh38）
- 形式: 非圧縮の `.vcf` または gzip 圧縮の `.vcf.gz`

## 使い方

### 1. Web 版を使う

ブラウザで https://medicalbioinfo.github.io/PhaseLadderPlot/ を開き、VCF ファイルをドラッグ＆ドロップ（またはファイル選択）してください。

### 2. ローカルで使う

1. このリポジトリを丸ごとダウンロードします（緑色の **Code** ボタン → **Download ZIP**、または `git clone https://github.com/medicalbioinfo/PhaseLadderPlot.git`）。
2. ZIP を展開し、フォルダ内の **`index.html`** をブラウザで開くと PhaseLadderPlot が使えます。

インストールやサーバーの起動は不要です。`index.html` と同じフォルダにある `phase-blocks.js`・`vendor/`・`assets/` も読み込むため、フォルダ構成は変えずにお使いください。

## プライバシー

VCF ファイルはブラウザ内でのみ処理され、外部のサーバーにアップロードされることはありません（Web 版でも同様です）。

## ファイル構成

| ファイル | 内容 |
|---|---|
| `index.html` | アプリ本体（画面・描画・VCF 読み込み） |
| `phase-blocks.js` | phase block の分割と統計量（N50 / NG50 など）の計算 |
| `vendor/pako.min.js` | `.vcf.gz` の展開に使う [pako](https://github.com/nodeca/pako)（MIT / Zlib ライセンス） |
| `assets/PhaseLadderPlot_icon.png` | アイコン |

---

## English summary

Phase Ladder Plot visualizes phase blocks along chromosomes from a phased VCF (a VCF carrying PS tags) on hg38 (GRCh38). VCFs from typical long-read pipelines (ONT, PacBio) already carry PS tags; short-read VCFs can be phased afterwards with tools such as WhatsHap.

Use it online at https://medicalbioinfo.github.io/PhaseLadderPlot/, or download this repository (Code → Download ZIP) and open `index.html` in a web browser. VCF data are processed locally in the browser and are never uploaded.
