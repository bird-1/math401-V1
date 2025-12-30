
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
你是一名资深的中国江苏省小学数学教研员。你的任务是分析用户上传的一组题目（PDF/图片内容），并与江苏苏教版（凤凰教育出版社）四年级上册的教学大纲进行比对。

大纲结构如下：
${syllabus}

请根据提供的题目内容，输出一份JSON格式的分析报告：
1. 识别出题目中涵盖的知识点（对应大纲ID）。
2. 识别出在大纲中但题目中完全没有涉及到的知识点（遗漏点）。
3. 给出每个遗漏点的具体补题建议。
4. 给出一份整体的评估意见。

必须以JSON格式返回，结构如下：
{
  "coveredTopics": ["unit1", "unit2"],
  "missingTopics": [
    { "topicId": "unit3", "reason": "未发现关于物体三视图的考查题目", "suggestion": "增加3-5道关于几何体多维度观察的填空或选择题" }
  ],
  "overallScore": 85,
  "aiCommentary": "整体覆盖较好，但在空间观念培养方面稍显薄弱...",
  "questionCount": 20
}
`;
