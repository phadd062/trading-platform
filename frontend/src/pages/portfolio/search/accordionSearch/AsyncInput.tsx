import Form from "react-bootstrap/Form";
import Async from "react-select/async";
import selectStyle from "components/select/selectStyle";

const AsyncInput = ({
	className,
	keySelect,
	id,
	placeholder,
	defaultOptions,
	value,
	onChange,
	loadOptions,
}: {
	className: string;
	keySelect: string;
	id: string;
	placeholder: string;
	defaultOptions: boolean;
	value: any;
	onChange: (event: any) => void;
	loadOptions: (inputValue: any, callback: any) => void;
}) => {
	return (
		<Form.Group className={className} controlId={id}>
			<Async
				key={keySelect}
				inputId={id}
				placeholder={placeholder}
				menuPortalTarget={document.body}
				styles={{
					...selectStyle({ errors: {}, includeError: false }),
					menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
				}}
				isMulti
				cacheOptions
				defaultOptions={defaultOptions}
				value={value}
				onChange={onChange}
				loadOptions={loadOptions}
				noOptionsMessage={(event: { inputValue: string }) => {
					if (event.inputValue) return "No options!";
					return "Too many options! Start Typing to filter and show less results..";
				}}
			/>
		</Form.Group>
	);
};

export default AsyncInput;
