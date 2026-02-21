import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import {
	faTags,
	faExternalLink,
	faSignOutAlt,
	faBars,
} from "@fortawesome/free-solid-svg-icons";
import { faBuilding } from "@fortawesome/free-regular-svg-icons";
import { Col, Row } from "react-bootstrap";
import { useHttpClient } from "store/httpClientContext/HttpClientContext";
import { NavLink } from "react-router-dom";
import "./style.css";

const Sidebar = () => {
	const [sidebarExpand, setSidebarExpand] = useState(true);
	const [collapseAuth, setCollapseAuth] = useState(true);

	const client = useHttpClient();

	return (
		<>
			<aside id="sidebar" className={sidebarExpand ? "expand" : ""}>
				<div className="d-flex">
					<button
						onClick={() => setSidebarExpand(!sidebarExpand)}
						className="toggle-btn"
						type="button"
					>
						<FontAwesomeIcon size="lg" icon={faBars} />
					</button>
					<div className="sidebar-logo">
						<a>Trading & Risk</a>
					</div>
				</div>
				<ul className="sidebar-nav">
					<li className="sidebar-item">
						<NavLink className="sidebar-link" to="/portfolio/dashboard">
							<Row className="fw-medium fs-6">
								<Col xs={2}>
									<FontAwesomeIcon icon={faBuilding} />
								</Col>
								<Col xs={10}>
									<span>Portfolio Dashboard</span>
								</Col>
							</Row>
						</NavLink>
					</li>
					<li className="sidebar-item">
						<NavLink className="sidebar-link" to="/portfolio/search">
							<Row className="fw-medium fs-6">
								<Col xs={2}>
									<FontAwesomeIcon icon={faTags} />
								</Col>
								<Col xs={10}>
									<span>Portfolio Search</span>
								</Col>
							</Row>
						</NavLink>
					</li>
					<li className="sidebar-item">
						<a
							className="sidebar-link collapsed has-dropdown"
							style={{ cursor: "pointer" }}
							data-bs-toggle="collapse"
							onClick={() => setCollapseAuth(!collapseAuth)}
						>
							<Row className="fw-medium fs-6">
								<Col xs={2}>
									<FontAwesomeIcon icon={faExternalLink} />
								</Col>
								<Col xs={10}>
									<span>Extra</span>
								</Col>
							</Row>
						</a>
						<ul
							id="auth"
							className={`sidebar-dropdown list-unstyled ${collapseAuth ? "collapse" : ""}`}
							data-bs-parent="#sidebar"
						>
							<li className="sidebar-item">
								<NavLink to="/instructions/add" className="sidebar-link">
									<span style={{ color: "text-body" }}>About</span>
								</NavLink>
							</li>
						</ul>
					</li>
					<li className="sidebar-item">
						<a
							onClick={() => client.logout()}
							style={{ cursor: "pointer" }}
							className="sidebar-link"
						>
							<Row className="fw-medium fs-6">
								<Col xs={2}>
									<FontAwesomeIcon icon={faSignOutAlt} />
								</Col>
								<Col xs={10}>
									<span>Logout</span>
								</Col>
							</Row>
						</a>
					</li>
				</ul>
			</aside>
		</>
	);
};

export default Sidebar;
