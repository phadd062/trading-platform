import { useHttpClient } from "store/httpClientContext/HttpClientContext";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { ACTIONS } from "../reducer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "react-router-dom";

const SimpleSearch = ({
	searchState,
	searchDispatch,
}: {
	searchState: any;
	searchDispatch: (action: any) => any;
}) => {
	const client = useHttpClient();

	const [_, setSearchParams] = useSearchParams();

	const formHandlerSimpleSearch = (event: any) => {
		event.preventDefault();

		const searchParamsValues: any = {};
		if (searchState.values.locationName !== "") {
			searchParamsValues["locationname"] = searchState.values.locationName;
		}

		if (searchState.values.buildingName !== "") {
			searchParamsValues["buildingname"] = searchState.values.buildingName;
		}

		if (searchState.values.address !== "") {
			searchParamsValues["address"] = searchState.values.address;
		}

		if (searchState.values.postalCode !== "") {
			searchParamsValues["postalcode"] = searchState.values.postalCode;
		}

		if (searchState.values.provinceValue.length !== 0) {
			const provinceList: string[] = [];
			searchState.values.provinceValue.forEach((obj: { value: string }) => {
				provinceList.push(obj.value);
			});
			searchParamsValues["province"] = provinceList;
		}

		if (searchState.values.cityValue.length !== 0) {
			const cityList: string[] = [];
			searchState.values.cityValue.forEach((obj: { value: string }) => {
				cityList.push(obj.value);
			});
			searchParamsValues["city"] = cityList;
		}

		if (searchState.values.departmentValue.length !== 0) {
			const departmentList: string[] = [];
			searchState.values.departmentValue.forEach((obj: { value: string }) => {
				departmentList.push(obj.value);
			});
			searchParamsValues["department"] = departmentList;
		}

		setSearchParams(searchParamsValues);
	};

	return (
		<Form onSubmit={formHandlerSimpleSearch}>
			<Row>
				<Form.Group
					className="col-sm-3 order-xxl-0"
					controlId="location_name_search"
				>
					<Form.Control
						value={searchState.values.locationName}
						onChange={(event) => {
							searchDispatch({
								type: ACTIONS.LOCATIONNAME,
								payload: { locationName: event.target.value },
							});
						}}
						type="text"
						maxLength={200}
						placeholder="Location"
					/>
				</Form.Group>

				<Form.Group
					className="col-sm-2 order-xxl-0"
					controlId="building_name_search"
				>
					<Form.Control
						value={searchState.values.buildingName}
						onChange={(event) => {
							searchDispatch({
								type: ACTIONS.BUILDINGNAME,
								payload: { buildingName: event.target.value },
							});
						}}
						type="text"
						maxLength={200}
						placeholder="Building"
					/>
				</Form.Group>

				<Form.Group className="col-sm-2 mb-xxl-0" controlId="address_search">
					<Form.Control
						value={searchState.values.address}
						onChange={(event) => {
							searchDispatch({
								type: ACTIONS.ADDRESS,
								payload: { address: event.target.value },
							});
						}}
						type="text"
						maxLength={200}
						placeholder="Address"
					/>
				</Form.Group>

				<Form.Group
					className="col-sm-2 order-xxl-2 mb-xxl-0"
					controlId="postal_code_search"
				>
					<Form.Control
						value={searchState.values.postalCode}
						onChange={(event) => {
							searchDispatch({
								type: ACTIONS.POSTALCODE,
								payload: { postalCode: event.target.value },
							});
						}}
						type="text"
						maxLength={200}
						placeholder="Postal Code"
					/>
				</Form.Group>

				<div className="col-sm-3 order-xxl-3 d-sm-grid">
					<Button className="shadow-none" variant="primary" type="submit">
						<FontAwesomeIcon icon={faSearch} /> Search
					</Button>
				</div>
			</Row>
		</Form>
	);
};

export default SimpleSearch;
