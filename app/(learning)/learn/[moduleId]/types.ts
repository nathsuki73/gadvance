export type SubTopic = {
  id: string;
  title: string;
  order_index: number;
};

export type LearningItem = {
  id: string;
  title: string;
  type: "pretest" | "lesson" | "posttest";
  order: number;
  subtopics?: SubTopic[]; // only present when type === "lesson"
};
