import type { ReactNode } from "react";
import SubHeader from "./courseDetails/subHeader";
import AboutLearningPlan from "./courseDetails/about";

type CourseTemplateProps = {
	children?: ReactNode;
};

export default function CourseTemplate({ children }: CourseTemplateProps) {
	return (
		<main className="min-h-screen w-full bg-[#F1F2F4] text-zinc-900">
			<div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 lg:px-8 lg:py-12">
				<SubHeader />
				<AboutLearningPlan />
				{children}
			</div>
		</main>
	);
}
