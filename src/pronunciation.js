// Listening guidance describes common connected-speech patterns, not an acoustic
// transcription of this speaker. Segment-specific audio verification is pending.
const rule = (type, phrase, heard, why, practice) => ({type, phrase, heard, why, practice, status:'pattern'});
const linking = (phrase, heard, why, practice='先慢读两个词，再不停顿地连起来；最后回到原声对照。') => rule('连读',phrase,heard,why,practice);
const weak = (phrase, heard, why) => rule('弱读',phrase,heard,why,'先保留清晰的内容词，再缩短功能词；不要追求把词吞掉。');
const rhythm = (phrase, heard, why) => rule('重音与分组',phrase,heard,why,'用斜线分组，先拍出重音节奏，再把轻读词填进去。');
const unreleased = (phrase, heard, why) => rule('不完全爆破',phrase,heard,why,'保留舌头或嘴唇的阻塞动作，直接过渡到后一个辅音，不要额外加元音。');
export const pronunciationNotes = {
  'opening:0': [linking('Good‿afternoon','good 与 afternoon 可能连成一个音组','good 以 /d/ 结尾，afternoon 以元音开头；词界通常不会有明显停顿。'),rhythm('good afterNOON / EVERYbody','afterNOON 的后半部分较突出','先抓问候语的重音，不要把每个音节读得一样重。')],
  'opening:1': [linking('Good‿afternoon','good 的词尾贴着 afternoon 的开头','这是记者的回应，也可用来比较不同说话人的节奏。')],
  'opening:2': [unreleased('Good to','/d/ 后紧接 /t/，不一定有单独清晰的爆破','相邻的两个齿龈塞音可能衔接得很紧，听不见爆破不等于 good 没有词尾。'),weak('of you','of 在非重读位置常读 /əv/','of 的元音可能很短，留意它与前后词组成的整体。')],
  'opening:3': [linking('It’s‿an‿honor','/ɪts ən ˈɑnɚ/（常见美式示意）','an 常读 /ən/；honor 的 h 不发音，所以 an 后仍可接元音连读。'),weak('to be','to 常弱读 /tə/','to 后接辅音 /b/ 且不重读时，元音常缩为 /ə/。')],
  'opening:4': [rule('美式闪音','a lot‿of','lot of 中的 /t/ 在部分美式读法里可变成短促 [ɾ]','元音间、后接非重读音节时，/t/ 有时听起来接近很短的 d；不是把拼写改成 d。','先听辨这种可能性，不必强求模仿；用 /t/ 清晰表达同样正确。'),rhythm('familiar faces / new faces','把 familiar 与 new 当作对照重点','长句可以按两个平行短语听，不要逐词追赶。')],
  'invitation:0': [linking('opening‿up','/ŋ/ 自然过渡到 up 的元音','opening 的结尾没有额外 /g/；不要在 up 前加一个 g 音。'),weak('to new media','to 常读 /tə/','句子的重点是 new media voices，而不是介词 to。')],
  'invitation:1': [linking('whose‿outlet','/z/ 与 outlet 的起始元音衔接','whose 的结尾是浊音 /z/，不是 /s/；听起来可能跨过词界。'),weak('one of the seats','of /əv/ 与 the /ðə/ 可能都较轻','先抓 one 与 seats，再补上中间的功能词。')],
  'invitation:2': [rhythm('journalists / podcasters / influencers / creators','听出列举的四个对象','每组各有重音，列表结束后再进入 to apply 的动作。'),weak('to cover','to 在 cover 前常读 /tə/','不要因短小的功能词而误以为两个内容词直接相邻。')],
  'invitation:3': [weak('you can apply','can 在非强调时常读 /kən/','肯定句中 can 的元音可能弱化；并非每次都读成完整的 /kæn/。'),linking('now‿on','元音之间通常平滑过渡','不要强加一个停顿或硬性的辅音；留意 now 后如何进入 on。')],
  'update:0': [weak('As for the','for 在非重读位置常读 /fɚ/（美式）','开头用来引出话题，重心在后面的 national security implications。'),rhythm('As for … / I spoke …','话题与信息分成两组','先识别话题，再听她交代已做过的沟通。')],
  'update:1': [linking('looking‿into','/ŋ/ 贴着 into 的元音','不要把 /ŋ/ 后面再补成 /ŋg/；留意整个 looking into 词组。'),rhythm('LOOKING INTO / what those MAY be','重读词帮助识别“正在调查”和不确定性','不要把 may 表达的可能性听成已经确认。')],
  'update:2': [linking('have‿an‿update','/hæv ən ˈʌpdeɪt/（分组示意）','have 的 /v/ 可以接 an；an 的 /n/ 又可以接 update 的元音。'),linking('share‿it','美式可近似 /ʃer ɪt/ 连在一起','这里的 /r/ 本来就在美式 share 中，不是额外插入的新音。')],
  'transition:0': [linking('turn‿it‿over','turn、it、over 可能像一个音组','前词的尾辅音与后词元音相接，让书写上的空格在听觉上变弱。'),weak('to questions','to 在 /k/ 前常读 /tə/','把重点放在 questions，介词轻轻带过。')],
  'confidence:0': [rhythm('you SAY / restore','记者在引用对方刚才用过的措辞','留意引用词与上下文，不把这个词当作新宣布的事实。')],
  'confidence:1': [rhythm('Is there FEAR / either … or …','先识别疑问框架，再听两个选择','there 通常不承载句子重音；不要因轻读而漏掉疑问结构。'),rhythm('either … / or …','听出两个备选情况','falling 与 fallen 的区别也承载时态信息。')],
  'confidence:2': [unreleased('would the','would 的 /d/ 紧接 the 的 /ð/，衔接可能很紧','不一定听到独立爆破，但不要机械删除词尾。'),linking('stays‿ahead','/z/ 衔接 ahead 的起始元音','stays 的结尾是 /z/；ahead 的第一音节常较轻。')],
  'confidence:3': [rhythm('NO / the president is CONFIDENT','先给短回答，再陈述立场','否定词 No 是回答结构的一部分，不能忽略。'),unreleased('confident that','/t/ 紧接 /ð/，可能没有明显爆破','保留词尾动作，听整组而非等待一个清楚的 t 爆破声。')],
  'conditions:0': [weak('as long as','两个 as 在不重读时常较轻','功能词元音可能缩短，先抓 long 与后面的条件。'),rhythm('as LONG as / you are CREATING','先听条件框架，再识别具体条件','这是说明条件，不是无条件的邀请。')],
  'conditions:1': [rule('缩约','you’re','/jʊr/ 或 /jɚ/（美式常见读法）','you are 的缩约通常比逐词读更短；两种读法取决于说话人和重音。','先对照 you are 与 you’re，再用相同节奏读后面的名词短语。')],
  'conditions:2': [weak('welcome to cover','to 在 cover 前常弱读 /tə/','听重点 welcome 与 cover；不要把缩短的 to 当成漏词。')],
  'no-date:0': [linking('As far‿as‿a date','as 与 a 可能合成紧凑的轻读部分','一串短词容易听成一团；先用 As far as… 识别话题框架。'),unreleased('specific date','/k/ 后接 /d/ 时不一定单独释放','specific 的末尾仍有收束动作，不要补读一个额外音节。')],
  'no-date:1': [linking('read‿out','/d/ 接 out 的起始元音','read out 是一组；接着听转折词 but。'),weak('to you','to 在 /j/ 前常读 /tə/','功能词不必逐词强调。')],
  'no-date:2': [weak('to implementing','to 后接元音时常保留较清楚的 /u/','to 的弱读不是永远 /tə/；前后音和强调都会影响实际读法。')],
  'no-date:3': [rhythm('just LIKE / his FIRST term','用对照理解过去与现在的关系','这里学习句式，不据此认可原片的政策评价。')],
  'check-back:0': [rhythm('guaranTEEing here','重音在 guaranteeing 的末段','先抓保证这一核心动作，不必把每个音节都听得一样重。'),rhythm('are you GUARANTEEING','记者在追问承诺的确定程度','句子的功能是确认保证，语气可能比普通询问更强。')],
  'check-back:1': [rhythm('NO individual / on Medicaid','否定词 no 与对象都很重要','先确认否定范围，避免把“没有任何个人”听反。')],
  'check-back:2': [rhythm('a CUTOFF / because of the PAUSE','听关键名词和原因','cutoff 是名词；不要与动词 cut off 的位置混淆。')],
  'check-back:3': [unreleased('check back / get back','/k/、/t/ 后接 /b/ 时可不单独爆破','尾辅音被后一个辅音遮住时，词界会更难听清；不是没有这个词尾。'),weak('get back to you','to 在 you 前常读 /tə/','把 get back to you 当作整体识别，不要逐个词等待。')],
};
export function getPronunciation(segment, index) {
  return pronunciationNotes[`${segment.id}:${index}`] || [rhythm(segment.lines[index].en, '按意义分组，优先听重音词', segment.lines[index].tip)];
}
export const pronunciationReference = 'https://www.teachingenglish.org.uk/professional-development/teachers/teaching-knowledge-database/c/connected-speech';
