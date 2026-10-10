import { makeWordId } from '../../lib/wordlists/import'
import type { Episode } from '../../types'

const targetWordIds = [
  makeWordId('BSL', 'fraud'),
  makeWordId('BSL', 'allegation'),
  makeWordId('BSL', 'integrity'),
  makeWordId('BSL', 'ethical'),
  makeWordId('BSL', 'resignation'),
  makeWordId('BSL', 'termination'),
  makeWordId('BSL', 'loyalty'),
  makeWordId('BSL', 'confidential'),
]

export const episode: Episode = {
  id: 'ep-003',
  order: 3,
  title: 'ตอนที่ 3: ความจริงที่ Northfield',
  content: `The compliance meeting room is smaller than you imagined, just a table, two officers, and a laptop that everyone keeps glancing at. You didn't sleep well, and from the look of him, neither did Daniel. He sits beside you, close enough that his knee bumps the table every time he shifts in his seat.

"Thank you both for coming," says the senior officer, a woman named Priya, opening a folder without quite looking at either of you yet. "We need to discuss a formal allegation of fraud connected to the invoice your audit uncovered."

Your pulse jumps at the word fraud, but Priya keeps her voice calm, almost kind, the way someone talks when they've had this conversation many times before and learned not to make it worse. "This isn't about either of you. The invoice traces back to a former employee who left the company last year. We believe he set up a fake supplier account before his resignation, and used it more than once before anyone noticed."

"Last year?" Daniel repeats. "I thought he just quit to work somewhere else."

"That's what most people were told," Priya says. "The truth is, we found early signs of this back then, but it was handled quietly. His resignation happened before we could confirm anything or move toward termination. Now the same pattern has shown up again, so the case has reopened."

Priya turns to you next, and for a second the room feels smaller than it already is. "I do need to ask — why didn't you report this the moment Daniel told you? Some people would call that a question of integrity."

You feel your face go warm, but you answer honestly, the way you've been rehearsing in your head since the invitation to this meeting arrived. "He asked me to keep it confidential for a few days while he figured out what was actually happening. I thought that was the ethical choice at the time — waiting for facts instead of starting a rumor that could hurt someone innocent, including Daniel, if it turned out to be nothing."

Daniel speaks up before Priya can respond. "That's true. If anything, keeping this quiet for those few days was my call, not theirs. They didn't hide anything from compliance. They helped me find it."

Priya studies you both for a long moment, then nods slowly. "That matches what we see in the records. For what it's worth, that was a reasonable, ethical way to handle an uncertain situation. We just needed to hear it directly."

The meeting ends with more questions than answers about the former employee, but none of them are about you or Daniel anymore. Walking out, Daniel exhales like he's been holding his breath since Monday. "I owe you one," he says. "Your loyalty to doing this properly, instead of just protecting me, probably saved both our jobs."

"I wasn't trying to protect anyone," you admit. "I just didn't want to guess wrong and make things worse for someone who didn't deserve it."

"That's exactly why it worked," he says, almost smiling for the first time all week. "Most people either report everything immediately or hide everything out of loyalty. You just... waited for enough information to be fair. I didn't know that was an option until you did it."

You're not sure how to answer that, so you just shrug, and for once the silence between you feels comfortable instead of tense.

That evening, Chloe finally tells you her secret over dinner: she's been offered a job at another company, and she's already decided to take it. "I didn't know how to bring it up," she says, turning her glass slowly on the table instead of looking at you. "Everything with you and Daniel sounded so stressful this week, I didn't want to pile on. But I've been sitting on this for ten days and I thought my face was going to give it away eventually."

You're happy for her, even as something in your chest sinks a little at the thought of the office without her in it. "When do you start?" you ask, and she winces.

"Three weeks," she says. "I know. It's soon. I'll still be around, though. Lunch doesn't stop just because the building changes."

Walking home, your phone buzzes one more time. It's Liam, asking if you're still free for dinner this weekend, completely unaware of the week you've just had. You smile and start typing a reply, grateful for one part of your life that still feels simple.

Then a second message appears, from a number you don't recognize. "We need to talk about what else that former employee was involved in. Call me when you can — alone, and keep this confidential for now." You stare at the screen, the quiet relief from ten minutes ago already slipping away.

Northfield, it seems, isn't finished with you yet.`,
  targetWordIds,
  contextualTranslations: {
    [targetWordIds[0]]: { th: 'การฉ้อโกง', partOfSpeech: 'noun', exampleSentence: 'A formal allegation of fraud connected to the invoice.' },
    [targetWordIds[1]]: { th: 'ข้อกล่าวหา', partOfSpeech: 'noun', exampleSentence: 'We need to discuss a formal allegation of fraud.' },
    [targetWordIds[2]]: { th: 'ความซื่อสัตย์/คุณธรรม', partOfSpeech: 'noun', exampleSentence: "Some people would call that a question of integrity." },
    [targetWordIds[3]]: { th: 'ถูกต้องตามจริยธรรม', partOfSpeech: 'adjective', exampleSentence: 'I thought that was the ethical choice at the time.' },
    [targetWordIds[4]]: { th: 'การลาออก', partOfSpeech: 'noun', exampleSentence: 'His resignation happened before we could confirm anything.' },
    [targetWordIds[5]]: { th: 'การเลิกจ้าง', partOfSpeech: 'noun', exampleSentence: 'Before we could confirm anything or move toward termination.' },
    [targetWordIds[6]]: { th: 'ความภักดี', partOfSpeech: 'noun', exampleSentence: 'Your loyalty to doing this properly probably saved both our jobs.' },
    [targetWordIds[7]]: { th: 'เป็นความลับ', partOfSpeech: 'adjective', exampleSentence: 'Call me when you can — alone, and keep this confidential for now.' },
  },
  quest: {
    questions: [
      {
        id: 'ep3-q1',
        type: 'fill-blank',
        prompt: "We need to discuss a formal ____ of fraud connected to the invoice.",
        choices: ['allegation', 'resignation', 'termination', 'loyalty'],
        answer: 'allegation',
        relatedWordIds: [targetWordIds[1], targetWordIds[0]],
      },
      {
        id: 'ep3-q2',
        type: 'fill-blank',
        prompt: 'His ____ happened before compliance could confirm anything.',
        choices: ['resignation', 'allegation', 'integrity', 'audit'],
        answer: 'resignation',
        relatedWordIds: [targetWordIds[4]],
      },
      {
        id: 'ep3-q3',
        type: 'choose-reply',
        prompt: "Priya: \"Why didn't you report this immediately?\" — เลือกคำตอบที่แสดงเหตุผลเชิงจริยธรรมได้ดีที่สุด",
        choices: [
          "I wanted the facts clear before raising concerns that could hurt someone innocent.",
          "I didn't think it was my problem.",
          "Daniel told me not to think about it.",
        ],
        answer: 'I wanted the facts clear before raising concerns that could hurt someone innocent.',
        relatedWordIds: [targetWordIds[2], targetWordIds[3]],
      },
      {
        id: 'ep3-q4',
        type: 'match',
        prompt: 'Daniel says the user\'s ____ to doing things properly probably saved both their jobs.',
        choices: ['loyalty', 'termination', 'resignation', 'fraud'],
        answer: 'loyalty',
        relatedWordIds: [targetWordIds[6]],
      },
      {
        id: 'ep3-q5',
        type: 'fill-blank',
        prompt: 'The mystery texter asks the user to keep the new information ____.',
        choices: ['confidential', 'ethical', 'legitimate', 'accountable'],
        answer: 'confidential',
        relatedWordIds: [targetWordIds[7]],
      },
    ],
  },
  summary:
    'ฝ่ายกำกับดูแลเปิดเผยว่ามีข้อกล่าวหา (allegation) เรื่องการฉ้อโกง (fraud) ของอดีตพนักงานที่ลาออก (resignation) ไปเมื่อปีก่อน ก่อนจะถึงขั้นเลิกจ้าง (termination) เจ้าหน้าที่ถามเรื่องความซื่อสัตย์ (integrity) ของผู้ใช้ แต่ยอมรับว่าการเลือกรอข้อมูลก่อนพูดคือทางเลือกที่ถูกต้องตามจริยธรรม (ethical) Daniel ขอบคุณผู้ใช้ที่มีความภักดี (loyalty) ต่อการทำสิ่งที่ถูกต้อง ตอนเย็น Chloe เปิดเผยว่าเธอได้งานใหม่และจะลาออก ปิดท้ายด้วยข้อความลึกลับที่ขอให้ผู้ใช้เก็บเรื่องใหม่เป็นความลับ (confidential) อีกครั้ง',
}
