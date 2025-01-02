import React from "react";
import { Box, House, LayoutDashboard, Upload } from "lucide-react";

const Dot = ({
	scrollToSection,
	section,
	currentSection,
	canScroll,
	children,
}: {
	scrollToSection: (number: number) => void;
	section: number;
	currentSection: number;
	canScroll: boolean;
	children: React.ReactNode;
}) => {
	return (
		<div
			onClick={() => {
				if (section >= 2 && !canScroll) return;
				scrollToSection(section);
			}}
			className={`p-2 text-white rounded-full ${
				section >= 2 && !canScroll ? "cursor-not-allowed" : "cursor-pointer"
			} m-2 ${
				section >= 2 && !canScroll
					? "bg-gray-300/40"
					: section === currentSection
					? "bg-purple-400"
					: "bg-purple-600/50"
			}`}
		>
			{children}
		</div>
	);
};

const Dash = () => {
	return <div className="w-52 h-[2px] bg-purple-600/20 m-2 rounded-full"></div>;
};

export const ScrollTracker = ({
	scrollToSection,
	currentSection,
	canScroll,
}: {
	scrollToSection: (number: number) => void;
	currentSection: number;
	canScroll: boolean;
}) => {
	return (
		<div className="fixed flex flex-col items-center z-50 w-3/5 bottom-1 left-1/2 -translate-x-1/2">
			<div className="flex items-center">
				<Dot
					scrollToSection={scrollToSection}
					section={0}
					currentSection={currentSection}
					canScroll={canScroll}
				>
					<House size={18} strokeWidth={1} />
				</Dot>{" "}
				<Dash />
				<Dot
					scrollToSection={scrollToSection}
					section={1}
					currentSection={currentSection}
					canScroll={canScroll}
				>
					<Upload size={18} strokeWidth={1} />
				</Dot>
				<Dash />
				<Dot
					scrollToSection={scrollToSection}
					section={2}
					currentSection={currentSection}
					canScroll={canScroll}
				>
					<LayoutDashboard size={18} strokeWidth={1} />
				</Dot>{" "}
				<Dash />
				<Dot
					scrollToSection={scrollToSection}
					section={3}
					currentSection={currentSection}
					canScroll={canScroll}
				>
					<Box size={18} strokeWidth={1} />
				</Dot>
			</div>
		</div>
	);
};
