import type { ReactNode } from "react";
import SubHeader from "./courseDetails/subHeader";
import AboutLearningPlan from "./courseDetails/about";

type CourseTemplateProps = {
	children?: ReactNode;
};

export default function CourseTemplate({ children }: CourseTemplateProps) {
	return (
		<main className="min-h-screen w-full bg-white text-zinc-900">
			<div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 lg:px-12">
				<SubHeader />
				<AboutLearningPlan />
				{children}
			</div>
		</main>
	);
}
