import type { TaxonomyKind } from '#shared/types/encyclopedia'

/**
 * Japanese terms PokeAPI does not provide: it has no Japanese for habitats, shapes, item categories,
 * move targets, encounter methods and similar. These are hand-written, using the games' own wording where
 * it is known. Anything missing here falls back to English, so a gap is never an error.
 *
 * `npm run ingest -- --audit` lists the slugs that still have no Japanese.
 */
export const GLOSSARY_JA: Partial<Record<TaxonomyKind, Record<string, string>>> = {
  'shape': {
    ball: '球形', squiggle: 'くねくね', fish: '魚形', arms: '腕つき', blob: '不定形', upright: '直立', legs: '脚つき',
    quadruped: '四足', wings: '翼', tentacles: '触手', heads: '複数の頭', humanoid: '人型', 'bug-wings': '虫の羽', armor: '甲殻',
  },
  'habitat': {
    cave: '洞窟', forest: '森', grassland: '草むら', mountain: '山', rare: '珍しい', 'rough-terrain': '荒れ地', sea: '海', urban: '町', 'waters-edge': '水辺',
  },
  'growth-rate': {
    'slow-then-very-fast': '60万タイプ', fast: '80万タイプ', medium: '100万タイプ', 'medium-slow': '105万タイプ', slow: '125万タイプ', 'fast-then-very-slow': '164万タイプ',
  },
  'move-target': {
    'specific-move': '特定の技', 'selected-pokemon-me-first': '選んだポケモン', ally: '味方1匹', 'users-field': '自分の場', 'user-or-ally': '自分か味方',
    'opponents-field': '相手の場', user: '自分', 'random-opponent': 'ランダムな相手', 'all-other-pokemon': '自分以外の全員', 'selected-pokemon': '選んだポケモン',
    'all-opponents': '相手全員', 'entire-field': '場全体', 'user-and-allies': '自分と味方', 'all-pokemon': '全員', 'all-allies': '味方全員', 'fainting-pokemon': 'ひんしのポケモン',
  },
  'move-ailment': {
    none: 'なし', paralysis: 'まひ', sleep: 'ねむり', freeze: 'こおり', burn: 'やけど', poison: 'どく', confusion: 'こんらん', infatuation: 'メロメロ',
    trap: 'バインド', nightmare: 'あくむ', torment: 'いちゃもん', disable: 'かなしばり', yawn: 'ねむけ', 'heal-block': 'かいふくふうじ',
    'no-type-immunity': 'タイプ無効の解除', 'leech-seed': 'やどりぎのタネ', embargo: 'さしおさえ', 'perish-song': 'ほろびのうた', ingrain: 'ねをはる',
    silence: '音技ふうじ', 'tar-shot': 'タールショット', protect: 'まもる',
  },
  'move-category': {
    damage: 'ダメージを与える', ailment: 'ダメージなし・状態異常にする', 'net-good-stats': 'ダメージなし・能力を変化させる', heal: 'ダメージなし・自分を回復',
    'damage-ailment': 'ダメージ＋状態異常', swagger: 'ダメージなし・状態異常＋相手の能力アップ', 'damage-lower': 'ダメージ＋相手の能力ダウン',
    'damage-raise': 'ダメージ＋自分の能力アップ', 'damage-heal': 'ダメージ＋HP吸収', ohko: '一撃必殺', 'whole-field-effect': '場全体に効果',
    'field-effect': '片側の場に効果', 'force-switch': '相手を交代させる', unique: '特殊な効果',
  },
  'learn-method': {
    'level-up': 'レベルアップ', egg: 'タマゴ', tutor: '教え技', machine: 'わざマシン', 'stadium-surfing-pikachu': 'スタジアム：なみのりピカチュウ',
    'light-ball-egg': 'ボルテッカー（ピチュー）', 'colosseum-purification': 'コロシアム：リライブ', 'xd-shadow': 'XD：ダークポケモン',
    'xd-purification': 'XD：リライブ', 'form-change': 'フォルムチェンジ', 'zygarde-cube': 'ジガルデキューブ', train: '特訓', reminder: '技思い出し',
  },
  'item-category': {
    'stat-boosts': '能力アップ', 'effort-drop': '努力値ダウン', medicine: 'くすり', other: 'その他', 'in-a-pinch': 'ピンチ発動', 'picky-healing': '好みで回復',
    'type-protection': 'タイプ半減', 'baking-only': 'ポフィン専用', collectibles: '収集品', evolution: '進化', spelunking: '探検', 'held-items': '持たせるもの',
    choice: 'こだわり系', 'effort-training': '努力値トレーニング', 'bad-held-items': '悪い持ち物', training: 'トレーニング', plates: 'プレート',
    'species-specific': '専用アイテム', 'type-enhancement': 'タイプ強化', 'event-items': 'イベント用', gameplay: 'ゲーム進行用', 'plot-advancement': 'ストーリー進行用',
    unused: '未使用', loot: 'お宝', 'all-mail': 'メール', vitamins: 'ビタミン', healing: '回復', 'pp-recovery': 'PP回復', revival: 'ふっかつ',
    'status-cures': '状態異常回復', mulch: 'こやし', 'special-balls': '特殊なボール', 'standard-balls': '標準のボール', 'dex-completion': '図鑑完成',
    scarves: 'スカーフ', 'all-machines': 'わざマシン', flutes: 'フエ', 'apricorn-balls': 'ボンボリボール', 'apricorn-box': 'ぼんぐりケース',
    'data-cards': 'データカード', jewels: 'ジュエル', 'miracle-shooter': 'ミラクルシューター', 'mega-stones': 'メガストーン', memories: 'メモリ',
    'z-crystals': 'Zクリスタル', 'species-candies': 'ポケモンのアメ', 'catching-bonus': '捕獲ボーナス', 'dynamax-crystals': 'ダイマックスクリスタル',
    'nature-mints': 'ミント', 'curry-ingredients': 'カレーの材料', 'tera-shard': 'テラピース', 'sandwich-ingredients': 'サンドウィッチの材料',
    'tm-materials': 'わざマシンの材料', picnic: 'ピクニック',
  },
  'item-pocket': {
    misc: 'どうぐ', medicine: 'くすり', pokeballs: 'モンスターボール', machines: 'わざマシン', berries: 'きのみ', mail: 'メール', battle: 'バトルアイテム', key: 'たいせつなもの',
  },
  'item-attribute': {
    countable: '複数所持可', consumable: '消耗品', 'usable-overworld': 'フィールドで使える', 'usable-in-battle': 'バトルで使える', holdable: '持たせられる',
    'holdable-passive': '持たせると自動で効果', 'holdable-active': '持たせて使う', underground: '地下で手に入る',
  },
  'fling-effect': {
    'badly-poison': 'もうどく', burn: 'やけど', 'berry-effect': 'きのみの効果', 'herb-effect': 'ハーブの効果', paralyze: 'まひ', poison: 'どく', flinch: 'ひるみ',
  },
  'stat': { special: 'とくしゅ' },
  'encounter-method': {
    walk: '草むら・洞窟を歩く', 'old-rod': 'ボロのつりざおで釣る', 'good-rod': 'いいつりざおで釣る', 'super-rod': 'すごいつりざおで釣る', surf: 'なみのり',
    'rock-smash': 'いわくだき', headbutt: '木にずつきをする', 'dark-grass': '濃い草むらを歩く', 'grass-spots': '揺れる草むらを歩く', 'cave-spots': '砂ぼこりの中を歩く',
    'bridge-spots': '橋の影を歩く', 'super-rod-spots': '水面の黒い影で釣る', 'surf-spots': '水面の黒い影でなみのり', 'yellow-flowers': '黄色い花の中を歩く',
    'purple-flowers': '紫の花の中を歩く', 'red-flowers': '赤い花の中を歩く', 'rough-terrain': '荒れ地を歩く', gift: '贈り物でもらう', 'gift-egg': 'タマゴを贈り物でもらう',
    static: '固定シンボルと戦う', pokeflute: 'ポケモンのふえを吹く', 'headbutt-low': '木にずつき（遭遇率：低）', 'headbutt-normal': '木にずつき（遭遇率：普通）',
    'headbutt-high': '木にずつき（遭遇率：高）', 'squirt-bottle': 'ウソッキーにジョウロを使う', 'wailmer-pail': 'ウソッキーにホエルコじょうろを使う', seaweed: '海藻のある場所でダイビング',
    'roaming-grass': 'フィールドの草むらをうろつく', 'roaming-water': 'フィールドの水面をうろつく', 'devon-scope': 'デボンスコープを使う',
    'feebas-tile-fishing': 'ヒンバスのいるマスで釣る', 'island-scan': 'アイランドスキャン', sos: 'SOSバトル', 'bubbling-spots': '水面の泡で釣る', 'berry-trees': 'きのみの木を調べる',
    'npc-trade': 'NPCと交換する', 'sos-from-bubbling-spot': '泡の場所からSOSバトル', overworld: 'フィールドを歩く', 'overworld-water': 'フィールドの水上',
    'overworld-flying': '空を飛ぶポケモン', 'overworld-special': '草むらでルアー・連続捕獲時のレア出現', 'overworld-flying-special': '空でルアー・連続捕獲時のレア出現',
    'overworld-water-special': '水上でルアー・連続捕獲時のレア出現', horde: '5匹の群れに遭遇する', 'colosseum-bonus-disc-us': '米国版コロシアムのボーナスディスクでジラーチをもらう',
    'colosseum-bonus-disc-jpn': '日本版コロシアムのボーナスディスクでセレビィかピカチュウをもらう', 'pokemon-channel-pal': 'PAL版ポケモンチャンネルでジラーチをもらう',
    'pokemon-ranger': 'ポケモンレンジャーでマナフィをもらう', 'pokemon-battle-revolution': 'ポケモンバトルレボリューションでピカチュウ・エレキブル・ブーバーンをもらう',
    'new-york-pokecenter-wish-eggs': 'ニューヨークのポケモンセンターで「ねがいごと」を覚えたタマゴをもらう', snag: 'コロシアム・XDでトレーナーのポケモンを奪う',
    'snag-rematch': 'コロシアム・XDで一度失敗したポケモンを再度奪う', pokespot: 'XDのポケスポットで野生のポケモンに出会う', 'hidden-grotto': 'かくれあなで出会う',
    'honey-tree': 'あまいミツを木に塗って待つ', 'overworld-dirt': '地中や沼から出現する', wanderer: '決まった場所に出現する特別なポケモン',
    'wanderer-water': '水中の決まった場所に出現する特別なポケモン', 'chase-water': '水に入ると縄張りのポケモンに追われる', 'dynamax-adventure': 'ダイマックスアドベンチャーで捕まえる',
    'max-raid': 'マックスレイドバトルでダイマックス・キョダイマックスを捕まえる', 'trash-can-ambush': 'ゴミ箱から奇襲される', 'rustling-bush-ambush': '揺れる茂みから奇襲される',
    'ceiling-ambush': '洞窟の天井から奇襲される', 'ground-ambush': '地面から奇襲される', 'sky-ambush': '空から奇襲される',
  },
  'pokedex': {
    national: '全国', kanto: 'カントー', 'original-johto': 'ジョウト（オリジナル）', hoenn: 'ホウエン（オリジナル）', 'original-sinnoh': 'シンオウ（オリジナル）',
    'extended-sinnoh': 'シンオウ（拡張）', 'updated-johto': 'ジョウト（更新）', 'original-unova': 'イッシュ（オリジナル）', 'updated-unova': 'イッシュ（更新）',
    'conquest-gallery': 'ギャラリー', 'kalos-central': 'カロス（セントラル）', 'kalos-coastal': 'カロス（コースタル）', 'kalos-mountain': 'カロス（マウンテン）',
    'updated-hoenn': 'ホウエン（更新）', 'original-alola': 'アローラ（オリジナル）', 'original-melemele': 'メレメレ（オリジナル）', 'original-akala': 'アーカラ（オリジナル）',
    'original-ulaula': 'ウラウラ（オリジナル）', 'original-poni': 'ポニ（オリジナル）', 'updated-alola': 'アローラ（更新）', 'updated-melemele': 'メレメレ（更新）',
    'updated-akala': 'アーカラ（更新）', 'updated-ulaula': 'ウラウラ（更新）', 'updated-poni': 'ポニ（更新）', 'letsgo-kanto': 'Let’s Go カントー', galar: 'ガラル',
    'isle-of-armor': '鎧の孤島', 'crown-tundra': '冠の雪原', hisui: 'ヒスイ', paldea: 'パルデア', kitakami: 'キタカミ', blueberry: 'ブルーベリー',
    'lumiose-city': 'ミアレシティ', hyperspace: 'ハイパースペース', champions: 'チャンピオンズ',
  },
  'evolution-trigger': {
    'level-up': 'レベルアップ', trade: '通信交換', 'use-item': 'どうぐを使う', shed: '脱皮', spin: '回転', 'tower-of-darkness': 'あくの塔で修行する',
    'tower-of-waters': 'みずの塔で修行する', 'three-critical-hits': '1回の戦闘で急所に3回当てる', 'take-damage': 'ダメージを受けたあと特定の場所へ行く',
    'in-battle-level-up': '戦闘中にレベルアップ', 'agile-style-move': 'すばやいスタイルで技を使う', 'strong-style-move': 'ちからのスタイルで技を使う',
    'recoil-damage': '反動ダメージを受ける', 'use-move': '技を使う', 'three-defeated-bisharp': 'おうじゃのしるしを持つコマタナを3匹倒す',
    'gimmighoul-coins': 'コレクレーのコインを999枚集める', 'meltan-candies': 'Pokémon GOでメルタンのアメを400個あげる', unclassified: '分類なし',
  },
  'time-of-day': { day: '昼', night: '夜', dusk: '夕方' },
  'version': { 'mega-dimension': 'メガディメンション', champions: 'チャンピオンズ' },
  'region': { orre: 'オーレ' },
  'encounter-condition': {
    'swarm-yes': '大量発生中', 'swarm-no': '大量発生していない', 'time-morning': '朝', 'time-day': '昼', 'time-night': '夜',
    'radar-on': 'ポケレーダー使用中', 'radar-off': 'ポケレーダー未使用',
    'weather-normal': '通常の天気', 'weather-overcast': 'くもり', 'weather-raining': '雨', 'weather-thunderstorm': '雷雨', 'weather-snowing': '雪',
    'weather-snowstorm': '吹雪', 'weather-sandstorm': '砂あらし', 'weather-intense-sun': '強い日差し', 'weather-fog': '霧',
    'season-spring': '春', 'season-summer': '夏', 'season-autumn': '秋', 'season-winter': '冬',
    'weekday-sunday': '日曜日', 'weekday-monday': '月曜日', 'weekday-tuesday': '火曜日', 'weekday-wednesday': '水曜日', 'weekday-thursday': '木曜日',
    'weekday-friday': '金曜日', 'weekday-saturday': '土曜日',
    'slot2-none': 'スロット2にソフトなし', 'slot2-ruby': 'スロット2にルビー', 'slot2-sapphire': 'スロット2にサファイア', 'slot2-emerald': 'スロット2にエメラルド',
    'slot2-firered': 'スロット2にファイアレッド', 'slot2-leafgreen': 'スロット2にリーフグリーン',
    'radio-off': 'ラジオ停止中', 'radio-hoenn': 'ホウエンラジオ', 'radio-sinnoh': 'シンオウラジオ',
    'bug-catching-contest-yes': 'むしとりたいかい中', 'bug-catching-contest-no': 'むしとりたいかい中ではない',
    'headbutt-tree-common': 'ずつきの木（ふつう）', 'headbutt-tree-rare': 'ずつきの木（まれ）', 'headbutt-tree-secret': 'ずつきの木（ひみつ）',
  },
}
