export const source = {
  title: 'Press Secretary Karoline Leavitt Briefs Members of the Media',
  date: '2025.01.28',
  videoId: 'xJOgsQQYDY4',
  official: 'https://www.whitehouse.gov/videos/press-secretary-karoline-leavitt-briefs-members-of-the-media-jan-28-2025/',
  commons: 'https://commons.wikimedia.org/wiki/File:Press_Secretary_Karoline_Leavitt_Briefs_Members_of_the_Media,_Jan._28,_2025.webm',
  subtitles: 'https://commons.wikimedia.org/wiki/TimedText:Press_Secretary_Karoline_Leavitt_Briefs_Members_of_the_Media,_Jan._28,_2025.webm.en-us.srt',
  media: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Press_Secretary_Karoline_Leavitt_Briefs_Members_of_the_Media%2C_Jan._28%2C_2025.webm',
  youtube: 'https://www.youtube.com/watch?v=xJOgsQQYDY4',
};
const line = (start, end, en, zh, tip, speaker = 'Karoline Leavitt') => ({start, end, en, zh, tip, speaker});
const originalSegments = [
  {
    id: 'opening', number: '01', title: '从一句自然的开场开始', english: 'Make a warm first impression.', category: '自然开场', level: 'B1', start: 3.29, end: 13.97, minutes: 8,
    description: '练习问候、停顿与句子重音，让开场更自然、更从容。',
    question: '第一次加入一个团队会议，你会怎样用英语开场？',
    hint: '问候 → 表达见面的喜悦 → 简短介绍自己。',
    answer: 'Good morning, everyone. It’s great to meet you all. I’m looking forward to working with this team.',
    comprehension: '开场时，她主要在做什么？', options: ['问候在场的人', '总结政策', '回答提问'], correct: 0,
    lines: [
      line(3.29, 4.59, 'Good afternoon, everybody.', '大家下午好。', '重读 afternoon；everybody 的尾音轻轻落下。'),
      line(4.59, 5.83, 'Good afternoon.', '下午好。', '听记者的回应，感受自然的对话节奏。', 'The Press'),
      line(5.83, 8.92, 'How are we? Good to see all of you.', '大家怎么样？很高兴见到各位。', 'How are we? 上扬；Good to see 连接起来。'),
      line(8.92, 10.99, 'It’s an honor to be here with all of you.', '很荣幸在这里与各位见面。', 'It’s an 连读；重读 honor 与 here。'),
      line(10.99, 13.97, 'A lot of familiar faces in the room, a lot of new faces.', '在场有很多熟面孔，也有很多新面孔。', '在 room 后停顿；familiar 与 new 形成对照。'),
    ],
    expressions: [
      {phrase: 'Good to see you.', meaning: '很高兴见到你。', tone: '日常可用', example: 'Good to see you again. How have you been?', note: '适合见面问候；初次见面也可用 Great to meet you。'},
      {phrase: 'It’s an honor to…', meaning: '做某事很荣幸。', tone: '正式', example: 'It’s an honor to be part of this team.', note: '正式感较强。日常可换成 I’m happy to… 或 It’s great to…。'},
    ],
  },
  {
    id: 'invitation', number: '02', title: '把邀请说得清楚又得体', english: 'Invite people into the conversation.', category: '清楚解释', level: 'B2', start: 424.61, end: 451.18, minutes: 12,
    description: '拆解较长句子，用短语分组清楚说明对象、条件与下一步。',
    question: '邀请不同背景的同事参加你的工作坊，并告诉他们如何报名。',
    hint: 'We welcome… → to join… → You can sign up…',
    answer: 'We welcome designers, developers, and anyone interested in the topic to join our workshop. You can sign up on our team website.',
    comprehension: '这段话的主要功能是什么？', options: ['结束记者会', '邀请新媒体申请并给出渠道', '介绍新的发言人'], correct: 1,
    lines: [
      line(424.61, 430.27, 'We’re also opening up this briefing room to new media voices who produce news-related content', '我们也向制作新闻相关内容的新媒体开放这间简报室，', '按 opening up / this briefing room / to new media voices 分组。'),
      line(430.27, 434.24, 'and whose outlet is not already represented by one of the seats in this room.', '其所属媒体目前尚未在这间屋内拥有席位。', 'whose 引导补充说明；represented 是重音词。'),
      line(435.01, 444.99, 'We welcome independent journalists, podcasters, social media influencers, and content creators to apply for credentials to cover this White House.', '我们欢迎独立记者、播客主持人、社交媒体创作者和内容创作者申请采访白宫的证件。', '列举时保留节奏，在最后一个对象后稍停再说 to apply。'),
      line(445.04, 451.18, 'And you can apply now on our new website, WhiteHouse.gov/NewMedia.', '现在可以通过我们新的网站 WhiteHouse.gov/NewMedia 申请。', '重读 apply now；网址前留一个短停顿。'),
    ],
    expressions: [
      {phrase: 'We welcome … to …', meaning: '我们欢迎某人做某事。', tone: '正式／友好', example: 'We welcome people of all backgrounds to join the discussion.', note: 'welcome 后接人，再接 to do；避免照搬过长的对象列表。'},
      {phrase: 'You can apply …', meaning: '你可以通过……申请。', tone: '清楚说明', example: 'You can apply through our website by Friday.', note: '工作坊报名通常用 sign up；职位、资质申请用 apply。'},
    ],
  },
  {
    id: 'update', number: '03', title: '暂时没有答案，也能从容回应', english: 'Respond without overpromising.', category: '回应追问', level: 'B2', start: 604.29, end: 611.83, minutes: 10,
    description: '用简短结构交代正在了解的事情，并说明后续如何更新。',
    question: '同事问你一个尚未确定的项目日期，你会如何回复？',
    hint: '说明已做的沟通 → 当前状态 → 有消息后更新。',
    answer: 'I spoke with the team this morning. They’re checking the timeline, and when I have an update, I’ll share it with you.',
    comprehension: '她如何处理尚待了解的信息？', options: ['给出一个确定日期', '拒绝后续沟通', '说明正在调查，并承诺有消息后更新'], correct: 2,
    lines: [
      line(604.29, 607.98, 'As for the national security implications, I spoke with NSC this morning.', '至于国家安全方面的影响，我今天早上与国家安全委员会沟通过。', 'As for 引出话题；implications 后稍作停顿。'),
      line(607.98, 609.78, 'They are looking into what those may be,', '他们正在调查可能有哪些影响，', 'looking into 自然连读；may 保留不确定的语气。'),
      line(609.78, 611.83, 'and when I have an update, I will share it with you, Mike.', '等我有了新消息，就会告诉你，Mike。', 'when I have an update 一组；share it 连读。'),
    ],
    expressions: [
      {phrase: 'look into …', meaning: '调查、了解某事。', tone: '日常／职场', example: 'We’re looking into the issue and will get back to you.', note: '比 look at 更强调进一步调查。'},
      {phrase: 'When I have an update, …', meaning: '等有了新消息，我会……', tone: '职场可用', example: 'When I have an update, I’ll send you a message.', note: 'when 从句使用一般现在时；避免承诺未经确认的时间。'},
    ],
  },
];
const additionalSegments = [
  {
    id:'transition', title:'自然转入问答', english:'Make room for questions.', category:'组织表达',level:'B1',start:528.55,end:530.69,minutes:6,
    description:'用一句过渡，结束陈述并把话题交给听众。',
    context:'发言人结束开场说明，准备转入记者提问。这里保留过渡句，完整上下文可通过原片查看。',
    question:'你做完一个简短项目介绍，怎样邀请大家提问？',hint:'结束介绍 → turn it over to questions / open it up for questions。',
    answer:'That covers our plan for next month. With that, I’ll open it up for questions.',
    comprehension:'这句话在沟通中起什么作用？',options:['补充数字','转入问答','结束所有交流'],correct:1,
    lines:[line(528.55,530.69,'And with that, I will turn it over to questions,','接下来，我将进入提问环节。','把 with that 和 turn it over to questions 分成两组。')],
    expressions:[
      {phrase:'With that, …',meaning:'接下来／说到这里，……',tone:'正式过渡',example:'With that, I’ll hand over to our designer.',note:'适合从一个环节转向下一个环节。'},
      {phrase:'open it up for questions',meaning:'开放提问。',tone:'会议可用',example:'I’d like to open it up for questions now.',note:'原创迁移表达；与原片的 turn it over to questions 含义相近，不是逐字引用。'},
    ],
  },
  {
    id:'confidence',title:'听懂追问，再明确回应',english:'Hear the question. State your position.',category:'回应追问',level:'B2',start:611.83,end:625.09,minutes:12,
    description:'听懂 either…or… 的追问结构，练习先给回答，再说明立场。',
    context:'记者接着前文有关 AI 的发言追问。课程只分析回答结构，不核验或认可原片中的政策评价。',
    question:'同事担心项目落后。你会怎样回应，并说明自己的判断？',hint:'先直接回应 → I’m confident that… → 给出你有依据的理由。',
    answer:'I understand the concern. I’m confident that we can meet the deadline because the main work is already complete.',
    comprehension:'发言人回答的结构是什么？',options:['先否定，再表明信心','先道歉，再给日期','完全转移到其他话题'],correct:0,
    lines:[
      line(611.83,614.7,'And, Karoline, you say “restore” U.S. dominance.','Karoline，你刚才说“恢复”美国的领先地位。','注意记者引用了上一段的关键词。','The Press'),
      line(614.7,618.57,'Is there fear that the U.S. either is falling or has fallen behind?','是否担心美国正在落后，或已经落后？','用 either…or… 区分两种情况。','The Press'),
      line(618.57,622.18,'And how would the president make sure the U.S. stays ahead?','总统又会怎样确保美国保持领先？','重心在 make sure 和 stays ahead。','The Press'),
      line(622.18,625.09,'No. The president is confident that we will restore American dominance in AI.','不。总统有信心，我们会恢复美国在 AI 领域的领先地位。','先听清 No，再听 confident that 后的立场。'),
    ],
    expressions:[
      {phrase:'be confident that …',meaning:'对……有信心。',tone:'明确立场',example:'I’m confident that we can finish the first version this week.',note:'要有依据地表达信心；不要当作对所有结果的保证。'},
      {phrase:'make sure …',meaning:'确保……',tone:'日常／职场',example:'How can we make sure everyone has time to prepare?',note:'先听清对方在问方法还是结果，再组织回应。'},
    ],
  },
  {
    id:'conditions',title:'把参与条件说明白',english:'Explain what makes someone eligible.',category:'清楚解释',level:'B2',start:714.43,end:722,minutes:8,
    description:'用 as long as 说明条件，再给出清晰的邀请。',
    context:'发言人回应新媒体准入问题，重申前文条件。片段从 Again 之后开始，不包含整个回答。',
    question:'向同事说明：只要提前读过材料，就可以参加讨论。',hint:'As long as + 条件 → you’re welcome to + 行动。',
    answer:'As long as you’ve read the background notes, you’re welcome to join the discussion.',
    comprehension:'邀请是否附带条件？',options:['完全无条件','只允许某一种平台','有，需要满足前面说明的条件'],correct:2,
    lines:[
      line(714.43,718.35,'as long as you are creating news-related content of the day','只要你制作当天的新闻相关内容，','先识别 as long as 这一条件结构。'),
      line(718.35,720.44,'and you’re a legitimate independent journalist,','并且是一位合规的独立记者，','you’re 是 you are 的缩约。'),
      line(720.44,722,'you’re welcome to cover this White House.','就欢迎你采访本届白宫。','在 welcome 后接 to do。'),
    ],
    expressions:[
      {phrase:'as long as …',meaning:'只要……',tone:'说明条件',example:'You can use the room as long as you book it in advance.',note:'此处表示条件，不表示时间长短。'},
      {phrase:'you’re welcome to …',meaning:'欢迎你／你可以……',tone:'友好邀请',example:'You’re welcome to bring a colleague to the meeting.',note:'不要与回答感谢的 You’re welcome 混淆。'},
    ],
  },
  {
    id:'no-date',title:'没有确定日期，怎样说明',english:'Be clear about what is still unknown.',category:'回应追问',level:'B2',start:2056.06,end:2063.14,minutes:9,
    description:'承认当前未知的信息，再说明已有的方向。',
    context:'记者询问关税时间安排。这里只截取回答末尾，练习日期不确定时的表达，不提供政策建议。',
    question:'客户想知道上线日期，但团队还未确定。你会如何回复？',hint:'As far as a date… → I don’t have… → 已确认的信息。',
    answer:'As far as a date, I don’t have a confirmed timeline yet. We’re still testing the final changes, and I’ll share an update when it’s ready.',
    comprehension:'她是否给出了具体日期？',options:['没有，说明目前没有具体日期','给出了明天的日期','说日期永远不会公布'],correct:0,
    lines:[
      line(2056.06,2058.46,'As far as a date, I don’t have a specific date','至于日期，我没有一个具体的日期','先把 As far as a date 作为话题框架。'),
      line(2058.46,2060.16,'to read out to you, but the president is committed','可以向你公布，但总统致力于','听清 but 标记的转折。'),
      line(2060.16,2061.74,'to implementing tariffs effectively,','有效实施关税，','committed to 后接动名词。'),
      line(2061.74,2063.14,'just like he did in his first term.','就像他在第一任期时那样。','将 just like 后的内容看作比较。'),
    ],
    expressions:[
      {phrase:'As far as …',meaning:'至于……／就……而言',tone:'切换话题',example:'As far as the budget, we’re still reviewing the options.',note:'口语中可以这样引出话题；更完整的写法可用 As far as … is concerned。'},
      {phrase:'I don’t have a specific date.',meaning:'我目前没有具体日期。',tone:'明确边界',example:'I don’t have a specific date yet, but I’ll update you after the review.',note:'可以补充 yet 和下一步，避免听起来像结束沟通。'},
    ],
  },
  {
    id:'check-back',title:'先核实，再回复',english:'Check the facts before making a promise.',category:'回应追问',level:'B2',start:2309.06,end:2316.8,minutes:9,
    description:'识别对方要求保证的追问，用核实和回访回应。',
    context:'记者就 Medicaid 资金暂停追问，要求确认个人是否会受影响。此前上下文可在原片 38:16 起查看；本段不替原片的政策陈述作事实背书。',
    question:'同事要求你保证一个尚未核实的数字，你会怎样回应？',hint:'I’ll check… → get back to you。可以补充明确的跟进方式。',
    answer:'I’ll check the latest numbers with the team and get back to you this afternoon.',
    comprehension:'她如何回应要求保证的追问？',options:['给出百分之百的保证','说会核实并回复','拒绝再讨论这个问题'],correct:1,
    lines:[
      line(2309.06,2310.7,'So, are you guaranteeing here','那么，你在这里保证','注意 guaranteeing 比普通询问更强。','The Press'),
      line(2310.7,2312.75,'that no individual now on Medicaid','目前任何 Medicaid 受益人','no individual 的否定范围很重要。','The Press'),
      line(2312.75,2315.12,'would see a cutoff because of the pause?','都不会因这次暂停而被中断资助吗？','先抓 cutoff 和 pause。','The Press'),
      line(2315.12,2316.8,'I’ll check back on that and get back to you.','我会再核实一下，然后回复你。','把 check back 和 get back to you 当作两个完整词组。'),
    ],
    expressions:[
      {phrase:'get back to you',meaning:'稍后回复你。',tone:'职场可用',example:'I’ll check with our designer and get back to you tomorrow.',note:'最好在确有把握时说明回复方式或时间。'},
      {phrase:'check back on …',meaning:'再次核实／跟进……',tone:'跟进信息',example:'Let me check back on the delivery status before I confirm.',note:'重点是先查证，避免在信息不足时作保证。'},
    ],
  },
];

export const courses = [{
  id:'first-briefing', number:'01', title:'从容表达的第一步', subtitle:'莱维特首次白宫记者会',
  date:'2025.01.28', speaker:'Karoline Leavitt', durationSeconds:2814,
  description:'从自然开场到回应追问，在同一场真实记者会里练习表达、听辨与临场回答。',
  source,
}];
export const lessons = [...originalSegments, ...additionalSegments].sort((a,b)=>a.start-b.start).map((segment,index)=>({...segment, courseId:'first-briefing', number:String(index+1).padStart(2,'0')}));
export const segments = lessons;
export const getCourse = id => courses.find(course=>course.id===id);
export const courseSegments = id => segments.filter(segment=>segment.courseId===id);
export const courseForSegment = segment => getCourse(segment.courseId);
export const segmentUrl = segment => '#/course/'+segment.courseId+'/segment/'+segment.id;
export function courseProgress(id, progress) {
  const items=courseSegments(id), completed=items.filter(item=>progress[item.id]?.completed).length;
  return {total:items.length, completed, percent:items.length?Math.round(completed/items.length*100):0};
}
export const steps = ['听懂', '模仿', '活用', '开口'];
export const duration = lesson => Math.round(lesson.end - lesson.start);
export function sentenceAt(lesson, time) {
  return lesson.lines.findIndex(line => time >= line.start && time < line.end);
}
export function formatTime(seconds) {
  const value = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}
