
import { SyllabusTopic } from './types';

export const SYLLABUS: SyllabusTopic[] = [
  {
    id: "unit1",
    title: "升和毫升",
    description: "容量单位及其换算",
    subPoints: ["认识容量单位升(L)", "认识容量单位毫升(mL)", "升与毫升之间的换算(1L=1000mL)"]
  },
  {
    id: "unit2",
    title: "两、三位数除以两位数",
    description: "除法运算及简便算法",
    subPoints: ["除数是整十数的口算和笔算", "除数不是整十数的试商(四舍五入法)", "商不变的规律", "连除实际问题"]
  },
  {
    id: "unit3",
    title: "观察物体",
    description: "从不同方向观察物体几何特征",
    subPoints: ["辨认从前面、右面和上面看到的形状", "根据看到的形状摆出几何体"]
  },
  {
    id: "unit4",
    title: "统计表和条形统计图",
    description: "数据收集、整理与呈现",
    subPoints: ["分段整理数据", "制作和分析单式条形统计图", "求平均数"]
  },
  {
    id: "unit5",
    title: "解决问题的策略",
    description: "运用列表、画图等方法解决问题",
    subPoints: ["用列表的方法整理信息", "分析数量关系并解答实际问题"]
  },
  {
    id: "unit6",
    title: "可能性",
    description: "确定现象与随机现象",
    subPoints: ["感受随机现象的客观性", "判断可能性的大小"]
  },
  {
    id: "unit7",
    title: "整数四则混合运算",
    description: "运算顺序与含有中括号的计算",
    subPoints: ["不含括号的三步混合运算", "含有小括号的三步混合运算", "含有中括号的三步混合运算"]
  },
  {
    id: "unit8",
    title: "垂线和平行线",
    description: "几何图形的基本性质",
    subPoints: ["认识射线、直线和角", "角的度量和分类", "认识互相垂直", "认识互相平行"]
  }
];

export const ANALYSIS_PROMPT = (syllabus: string) => `
你是一名资深的中国江苏省小学数学教研员。你的任务是分析用户上传的题目内容，并与苏教版（凤凰教育出版社）四年级上册的大纲比对。

大纲结构：
${syllabus}

请输出JSON格式报告：
1. topicScores: 必须包含大纲中【所有8个单元】。为每个单元打分(0-100)，代表该单元在题目中的覆盖深度和题量权重。若完全未提及则为0。
2. missingTopics: 仅列出得分显著偏低（如低于40分）或完全遗漏的单元。
3. overallScore: 整体大纲覆盖度评分(0-100)。
4. aiCommentary: 专业教研评价。
5. questionCount: 识别出的总题数。

JSON结构要求：
{
  "topicScores": [
    { "topicId": "unit1", "score": 90 },
    { "topicId": "unit2", "score": 0 },
    ...
  ],
  "missingTopics": [
    { "topicId": "unit2", "reason": "...", "suggestion": "..." }
  ],
  "overallScore": 75,
  "aiCommentary": "...",
  "questionCount": 15
}
`;
