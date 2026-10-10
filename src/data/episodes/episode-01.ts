import { makeWordId } from '../../lib/wordlists/import'
import type { Episode } from '../../types'

const targetWordIds = [
  makeWordId('BSL', 'deadline'),
  makeWordId('BSL', 'postpone'),
  makeWordId('BSL', 'audit'),
  makeWordId('BSL', 'suspicious'),
  makeWordId('BSL', 'confidential'),
  makeWordId('BSL', 'supervisor'),
  makeWordId('BSL', 'accountable'),
  makeWordId('BSL', 'invoice'),
]

export const episode: Episode = {
  id: 'ep-001',
  order: 1,
  title: 'ตอนที่ 1: วันแรกที่ Northfield',
  content: `Your first week at Northfield Partners already feels like a test. You still don't know where the good coffee machine is, you've already forgotten three names, and the Q3 report is due Friday. Everyone around you keeps repeating the same word: deadline.

Your desk sits across from Daniel's, close enough that you've learned his habits fast. He arrives early, drinks his coffee black, and usually hums quietly while he works. This morning he isn't humming at all.

He stops by your desk, holding his laptop against his chest like something he doesn't want anyone else to see. "We might need to postpone the client call," he says, not quite looking at you. "I've been asked to run an audit on the regional numbers, and the audit isn't going well."

You open the shared folder. Three different versions of the same audit, three different totals. The deadline is only four days away, and nobody wants to say out loud why the numbers keep changing.

"Can I help with the audit?" you ask. Daniel hesitates, then lowers his voice. "This has to stay confidential for now. Only our supervisor knows I'm even looking into it. If this gets out before we understand it, people will panic for no reason."

Across the room, your supervisor walks past without stopping, coffee in hand, completely unaware of the conversation happening twenty feet away. Daniel watches her go, then exhales like he's been holding his breath since she rounded the corner. "If she finds out before I have an answer, it stops being a quiet question and becomes an official one," he says. "I need time, not panic."

"Who's accountable if the numbers really are wrong?" you ask. Daniel doesn't answer right away. "That's what I'm trying to find out. And right now, something about this feels suspicious."

He scrolls through the file and stops on one line. An invoice from a supplier you've never heard of, dated the same week the numbers first went strange. "This invoice shouldn't be here," he says quietly. "I don't remember approving it, and I sign off on everything that size."

"Why tell me, of all people?" you ask. "You're the only one here with no history at this company," Daniel says. "No one will think you're protecting a friend. I need a second pair of eyes I can actually trust before the deadline, not after."

It's a strange kind of compliment, being trusted because you're still a stranger. You think about saying no, going back to your own work, and letting someone else sort out whatever this is. Instead, you find yourself nodding, partly out of curiosity and partly because Daniel looks like he hasn't slept properly in days.

You spend the rest of the afternoon helping him sort the audit folder, matching each invoice to a project, a date, a signature. Most of it lines up. A few lines don't. One invoice has a signature that looks almost like Daniel's, but not quite, the letters a little too careful, like someone copying a style instead of simply writing their own name.

"Did you sign this one?" you ask, turning the screen toward him.

Daniel leans in, frowns, and shakes his head slowly. "That's not how I write a D." He says it quietly, like he's trying the idea on for size before deciding whether to believe it himself. For a moment neither of you says anything, the office noise around you suddenly very loud.

By five o'clock, you're both more confused than when you started, and the deadline hasn't moved an inch closer to being solved. Daniel finally closes his laptop. "Don't mention the audit to anyone else yet. Not even to be friendly. I'll explain everything once I know what I'm looking at." You nod, though you're not sure you believe the explanation will be simple.

Your phone buzzes on the walk out. A message from Chloe: "lunch tmrw?? need to tell you something 👀"

You almost laugh. Everyone in your life suddenly has a secret. At the elevator, you glance back at the office windows, where Daniel is still at his desk, the audit file open in front of him, still staring at that one signature that doesn't quite match.

On the train home, you keep thinking about his question. Who is accountable for an invoice nobody remembers approving? You've worked here for exactly five days, and you're already holding information you weren't supposed to have. It should feel like too much, and somehow it doesn't, not yet.

You lock your phone and watch the city go by outside the window, replaying the look on Daniel's face when he saw that signature. First week, and already you know something most of the building doesn't. Something is off at Northfield Partners, and the deadline is the least of your problems.`,
  targetWordIds,
  contextualTranslations: {
    [targetWordIds[0]]: { th: 'เส้นตายส่งงาน', partOfSpeech: 'noun', exampleSentence: 'The deadline is only four days away.' },
    [targetWordIds[1]]: { th: 'เลื่อนออกไป', partOfSpeech: 'verb', exampleSentence: 'We might need to postpone the client call.' },
    [targetWordIds[2]]: { th: 'การตรวจสอบบัญชี', partOfSpeech: 'noun', exampleSentence: "I've been asked to run an audit on the regional numbers." },
    [targetWordIds[3]]: { th: 'น่าสงสัย', partOfSpeech: 'adjective', exampleSentence: 'Something about this feels suspicious.' },
    [targetWordIds[4]]: { th: 'เป็นความลับ', partOfSpeech: 'adjective', exampleSentence: 'This has to stay confidential for now.' },
    [targetWordIds[5]]: { th: 'หัวหน้างาน/ผู้บังคับบัญชา', partOfSpeech: 'noun', exampleSentence: "Only our supervisor knows I'm even looking into it." },
    [targetWordIds[6]]: { th: 'รับผิดชอบ (ต่อผลที่เกิดขึ้น)', partOfSpeech: 'adjective', exampleSentence: "Who's accountable if the numbers really are wrong?" },
    [targetWordIds[7]]: { th: 'ใบแจ้งหนี้', partOfSpeech: 'noun', exampleSentence: 'An invoice from a supplier you\'ve never heard of.' },
  },
  quest: {
    questions: [
      {
        id: 'ep1-q1',
        type: 'fill-blank',
        prompt: "We might need to ____ the client call.",
        choices: ['postpone', 'audit', 'deadline', 'confidential'],
        answer: 'postpone',
        relatedWordIds: [targetWordIds[1]],
      },
      {
        id: 'ep1-q2',
        type: 'fill-blank',
        prompt: 'This has to stay ____ for now.',
        choices: ['confidential', 'accountable', 'suspicious', 'supervisor'],
        answer: 'confidential',
        relatedWordIds: [targetWordIds[4]],
      },
      {
        id: 'ep1-q3',
        type: 'choose-reply',
        prompt: "Daniel: \"Can you keep this between us until the deadline?\" — เลือกคำตอบที่เหมาะสมที่สุด",
        choices: [
          "Of course. I won't say anything until you're ready.",
          "I already told Chloe about it.",
          'Maybe, if it benefits me somehow.',
        ],
        answer: "Of course. I won't say anything until you're ready.",
        relatedWordIds: [targetWordIds[0], targetWordIds[4]],
      },
      {
        id: 'ep1-q4',
        type: 'match',
        prompt: 'Who is accountable for checking an unusual invoice before it gets paid?',
        choices: ['The supervisor', 'The client', 'Chloe'],
        answer: 'The supervisor',
        relatedWordIds: [targetWordIds[5], targetWordIds[6], targetWordIds[7]],
      },
      {
        id: 'ep1-q5',
        type: 'fill-blank',
        prompt: 'Daniel finds an ____ from a supplier he has never heard of.',
        choices: ['invoice', 'audit', 'deadline', 'supervisor'],
        answer: 'invoice',
        relatedWordIds: [targetWordIds[7]],
      },
    ],
  },
  summary:
    'วันแรกของผู้ใช้ที่ Northfield Partners: Daniel ขอให้ช่วยตรวจสอบ (audit) ตัวเลขรายภูมิภาคที่ไม่ตรงกัน เจอใบแจ้งหนี้ (invoice) จากซัพพลายเออร์ที่ไม่คุ้นเคย Daniel ขอให้เก็บเป็นความลับ (confidential) ก่อนถึงเดดไลน์ (deadline) และบอกว่ามีแต่หัวหน้างาน (supervisor) ของเขาที่รู้เรื่องนี้ ผู้ใช้เริ่มสงสัย (suspicious) ว่าใครต้องรับผิดชอบ (accountable) กับความผิดพลาดนี้ ส่วน Chloe ทักมาขอนัดกินข้าวพรุ่งนี้เพื่อบอกอะไรบางอย่าง',
}
