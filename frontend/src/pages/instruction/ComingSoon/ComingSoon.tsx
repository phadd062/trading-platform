import React, { useState } from "react";
import "./ComingSoon.css";

const ComingSoonPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState(0);

	const handleTabClick = (index: number) => {
		setActiveTab(index);
	};

	return (
		<div style={{ textAlign: "center" }}>
			<section style={{ marginBottom: "100px" }}>
				<h1 className="mt-3">Coming Soon!</h1>
			</section>
		</div>
	);
};

export default ComingSoonPage;
