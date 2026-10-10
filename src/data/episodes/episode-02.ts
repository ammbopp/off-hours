import { makeWordId } from '../../lib/wordlists/import'
import type { Episode } from '../../types'

const targetWordIds = [
  makeWordId('BSL', 'rumor'),
  makeWordId('BSL', 'leak'),
  makeWordId('BSL', 'confront'),
  makeWordId('BSL', 'compliance'),
  makeWordId('BSL', 'transparency'),
  makeWordId('BSL', 'negligence'),
  makeWordId('BSL', 'legitimate'),
  makeWordId('BSL', 'overtime'),
]

export const episode: Episode = {
  id: 'ep-002',
  order: 2,
  title: 'ตอนที่ 2: เสียงกระซิบในออฟฟิศ',
  content: `Chloe is already waiting when you get to the café, two coffees on the table and her phone face-down beside them, which is never a good sign. "Okay, don't freak out," she says, before you've even sat down, "but there's a rumor going around the office. People in Marketing are saying someone in Finance is in trouble over a huge accounting mistake."

You sit, slowly, trying to keep your face neutral. "Freak out about what, specifically?"

"That's the thing, nobody has the details." Chloe wraps both hands around her cup and studies you over the rim of it, the way she's done since college whenever she already half-knows the answer to the question she's about to ask. "Just that something got messed up on the Q3 numbers and it's bigger than anyone expected. You work near Daniel, right? Do you know anything?"

You don't answer right away, which is answer enough. If people in another department are already repeating this rumor, it means the audit didn't stay confidential the way Daniel hoped. Somehow, it leaked.

Back at your desk after lunch, you find out how. An old email thread was forwarded to half the building by accident, the same spreadsheet Daniel asked you to keep quiet attached at the bottom, three replies deep under a subject line that now reads "Re: Re: Fwd: Q3 question???" You scroll through the names in the recipient list and recognize almost none of them. Whoever caused the leak probably didn't mean to, but it's done now, and there's no way to call it back.

You read the thread twice, half expecting your own name to appear somewhere in it. It doesn't, which should be a relief and mostly isn't, because now you have to decide what to do with information everyone else already has.

You find Daniel near the printer, eyes fixed on his phone, scrolling the same way you were five minutes ago. This time, you decide not to wait for him to explain things on his own schedule. "I need you to confront this directly," you say, keeping your voice low. "People already know. I think you should tell me everything, right now, before someone asks me a question I can't answer honestly."

He finally looks up. "Compliance called me into a meeting this morning. They want full transparency on the audit before Friday — every invoice, every signature, every date. If I can't explain the numbers clearly, this stops being my problem to fix quietly."

"Is that bad for you?" you ask.

Daniel laughs, short and humorless. "It could be worse than bad. It could look like negligence," he admits. "Like I approved things without checking them properly. And if even one of those invoices wasn't for legitimate work, compliance will assume I either missed it or let it happen."

You think about the invoice from the unfamiliar supplier, the signature that looked almost right and wasn't. "Do you think it wasn't legitimate?"

"I don't know anymore," Daniel says, rubbing his eyes. He looks like he's aged a few years since Monday. "I've been staying late almost every night this week, going through old records on my own time, cross-checking supplier names against anything I can find. My manager doesn't even know I've been working overtime on this. I just wanted to fix it quietly before anyone noticed there was anything to fix."

"That's a lot of overtime for something you're not even sure is real," you say.

"I know. But if it is real, and I did nothing, that's worse." He glances toward the compliance office down the hall, like it might be listening. "At least now it's not just mine to carry."

"Someone already noticed," you say gently. "That's kind of the problem."

He almost laughs, tired rather than amused. "Yeah. I'm starting to understand that."

Before you can ask anything else, his phone buzzes. He glances at the screen and his expression changes completely. "Compliance wants to talk to both of us. Tomorrow morning. Apparently someone told them you've been helping me with the audit."

"Me? Who would even—" You stop. Only a few people knew you were involved at all, and you can count them on one hand without using all your fingers.

Daniel meets your eyes, and for the first time, he looks less like your coworker and more like someone who isn't sure who he can trust either. "I don't know," he says quietly. "But I think it's time we found out."

You spend the rest of the evening rereading the leaked thread, trying to guess who forwarded it and why, and coming up with nothing solid. Whoever it was either wanted the truth out in the open, or wanted you and Daniel to look guilty before anyone had the full story. You're not sure which possibility worries you more.`,
  targetWordIds,
  contextualTranslations: {
    [targetWordIds[0]]: { th: 'ข่าวลือ', partOfSpeech: 'noun', exampleSentence: "There's a rumor going around the office." },
    [targetWordIds[1]]: { th: 'ข้อมูลรั่วไหล', partOfSpeech: 'noun/verb', exampleSentence: 'It leaked, and there\'s no way to call it back.' },
    [targetWordIds[2]]: { th: 'เผชิญหน้า/ถามตรงๆ', partOfSpeech: 'verb', exampleSentence: 'I need you to confront this directly.' },
    [targetWordIds[3]]: { th: 'ฝ่ายกำกับดูแล/การปฏิบัติตามกฎ', partOfSpeech: 'noun', exampleSentence: 'Compliance called me into a meeting this morning.' },
    [targetWordIds[4]]: { th: 'ความโปร่งใส', partOfSpeech: 'noun', exampleSentence: 'They want full transparency on the audit before Friday.' },
    [targetWordIds[5]]: { th: 'ความประมาทเลินเล่อ', partOfSpeech: 'noun', exampleSentence: 'It could look like negligence.' },
    [targetWordIds[6]]: { th: 'ถูกต้องตามกฎ/มีเหตุผลรองรับ', partOfSpeech: 'adjective', exampleSentence: "If even one of those invoices wasn't for legitimate work..." },
    [targetWordIds[7]]: { th: 'การทำงานล่วงเวลา', partOfSpeech: 'noun', exampleSentence: "I've been working overtime on this." },
  },
  quest: {
    questions: [
      {
        id: 'ep2-q1',
        type: 'fill-blank',
        prompt: "There's a ____ going around the office about Finance.",
        choices: ['rumor', 'leak', 'compliance', 'overtime'],
        answer: 'rumor',
        relatedWordIds: [targetWordIds[0]],
      },
      {
        id: 'ep2-q2',
        type: 'fill-blank',
        prompt: 'An old email thread was forwarded by accident — the spreadsheet ____.',
        choices: ['leaked', 'confronted', 'postponed', 'audited'],
        answer: 'leaked',
        relatedWordIds: [targetWordIds[1]],
      },
      {
        id: 'ep2-q3',
        type: 'choose-reply',
        prompt: "Chloe: \"Do you know anything about the rumor?\" — เลือกคำตอบที่เหมาะสมที่สุด ถ้ายังเก็บเรื่องนี้เป็นความลับอยู่",
        choices: [
          "I can't really talk about it right now.",
          "Yes, Daniel is in huge trouble.",
          "Here's the whole spreadsheet, take a look.",
        ],
        answer: "I can't really talk about it right now.",
        relatedWordIds: [targetWordIds[0], targetWordIds[1]],
      },
      {
        id: 'ep2-q4',
        type: 'match',
        prompt: 'Compliance wants which of these from Daniel before Friday?',
        choices: ['Full transparency on the audit', 'A day off', 'A new supplier'],
        answer: 'Full transparency on the audit',
        relatedWordIds: [targetWordIds[3], targetWordIds[4]],
      },
      {
        id: 'ep2-q5',
        type: 'fill-blank',
        prompt: "If the invoice wasn't for ____ work, compliance will ask hard questions.",
        choices: ['legitimate', 'confidential', 'accountable', 'suspicious'],
        answer: 'legitimate',
        relatedWordIds: [targetWordIds[6]],
      },
    ],
  },
  summary:
    'Chloe บอกผู้ใช้ว่ามีข่าวลือ (rumor) เรื่องปัญหาบัญชีกระจายไปทั่วออฟฟิศแล้ว เพราะอีเมลที่มีไฟล์ตรวจสอบหลุด (leak) ไปถึงแผนกอื่น ผู้ใช้เผชิญหน้า (confront) ถาม Daniel ตรงๆ และรู้ว่าฝ่ายกำกับดูแล (compliance) เรียก Daniel ไปคุยแล้ว ต้องการความโปร่งใส (transparency) เต็มรูปแบบก่อนวันศุกร์ Daniel กลัวว่าจะดูเหมือนความประมาท (negligence) ของตัวเอง และไม่แน่ใจว่าใบแจ้งหนี้นั้นถูกต้องตามกฎ (legitimate) หรือไม่ เขาทำงานล่วงเวลา (overtime) คนเดียวมาหลายคืน และตอนนี้ฝ่ายกำกับดูแลอยากคุยกับผู้ใช้ด้วย',
}
