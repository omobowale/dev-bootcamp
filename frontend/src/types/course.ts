export interface CourseListItem {
  openCohortCount?: number;
  nextStartDate?: string | null;
  privateTutorialAvailable?: boolean;
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  image: string | null;
  level: string | null;
  duration: string | null;
  mode: string | null;
  price: number | null;
  discountPrice: number | null;
  certificateAvailable: boolean;
  aiSkillsDescription: string | null;
}

export interface CourseTopic {
  id: number;
  moduleId: number;
  title: string;
  position: number;
}

export interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  position: number;
  topics: CourseTopic[];
}

export interface Faq {
  id: number;
  courseId: number | null;
  question: string;
  answer: string;
  position: number;
}

export interface WhatsIncludedItem {
  title: string;
  description: string | null;
}

export interface CourseDetail {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  image: string | null;
  level: string | null;
  duration: string | null;
  mode: string | null;
  price: number | null;
  discountPrice: number | null;
  requirements: string | null;
  targetAudience: string | null;
  certificateAvailable: boolean;
  instructorName: string | null;
  instructorBio: string | null;
  instructorAvatarUrl: string | null;
  projects: string | null;
  whatsIncluded: WhatsIncludedItem[];
  aiSkillsDescription: string | null;
  modules: CourseModule[];
  faqs: Faq[];
}

export interface PrivateTutorialOption {
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  courseImage: string | null;
  shortDescription: string | null;
  level: string | null;
  price: number | null;
  discountPrice: number | null;
  aiSkillsDescription: string | null;
  cohortId: number;
  cohortName: string;
}
