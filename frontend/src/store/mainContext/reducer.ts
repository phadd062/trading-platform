export const GROUP = {
	ADMIN: "admin",
	HUBLEAD: "hublead",
	DEPARTMENTLEAD: "departmentlead",
	EDITOR: "editor",
	VIEWER: "viewer",
};

export const ACTIONS = {
	MAIN: "main",
	GROUP: "group",
};

export const reducerInitial = {
	group: {
		ADMIN: false,
		HUBLEAD: false,
		DEPARTMENTLEAD: false,
		EDITOR: false,
		VIEWER: false,
		HUBLEADUP: false,
		DEPARTMENTLEADUP: false,
		EDITORUP: false,
		VIEWERUP: false,
	},
	user: null,
	tm: null,
	color: {
		// blue
		one: {
			hex: "#084AFA",
			rgb: "rgb(13,110,253)",
		},
		// light blue
		two: {
			hex: "#91A5E0",
			rgb: "rgb(145,165,224)",
		},
		// purple
		three: {
			hex: "#B565E0",
			rgb: "rgb(181,101,224)",
		},
		// gray
		four: {
			hex: "#EDDBCA",
			rgb: "rgb(237,219,202)",
		},
		// pink
		five: {
			hex: "#E01894",
			rgb: "rgb(214,51,132)",
		},
		// gray
		six: {
			hex: "#000000",
			rgb: "rgb(189,189,189)",
		},
		// gray
		seven: {
			hex: "#198754",
			rgb: "rgb(25,135,84)",
		},
	},
};

export const reducer = (
	state: {
		group: {
			ADMIN: boolean;
			HUBLEAD: boolean;
			DEPARTMENTLEAD: boolean;
			EDITOR: boolean;
			VIEWER: boolean;
			HUBLEADUP: boolean;
			DEPARTMENTLEADUP: boolean;
			EDITORUP: boolean;
			VIEWERUP: boolean;
		};
		user: any;
		tm: any;
		color: any;
	},
	action: { type: string; payload: any },
) => {
	switch (action.type) {
		case ACTIONS.GROUP:
			switch (action.payload.group) {
				case GROUP.ADMIN:
					return {
						...state,
						group: {
							...state.group,
							ADMIN: true,
							HUBLEADUP: true,
							DEPARTMENTLEADUP: true,
							EDITORUP: true,
							VIEWERUP: true,
						},
					};
				case GROUP.HUBLEAD:
					return {
						...state,
						group: {
							...state.group,
							HUBLEAD: true,
							HUBLEADUP: true,
							DEPARTMENTLEADUP: true,
							EDITORUP: true,
							VIEWERUP: true,
						},
					};
				case GROUP.DEPARTMENTLEAD:
					return {
						...state,
						group: {
							...state.group,
							DEPARTMENTLEAD: true,
							DEPARTMENTLEADUP: true,
							EDITORUP: true,
							VIEWERUP: true,
						},
					};
				case GROUP.EDITOR:
					return {
						...state,
						group: {
							...state.group,
							EDITOR: true,
							EDITORUP: true,
							VIEWERUP: true,
						},
					};
				case GROUP.VIEWER:
					return {
						...state,
						group: {
							...state.group,
							VIEWER: true,
							VIEWERUP: true,
						},
					};
				default:
					return state;
			}

		case ACTIONS.MAIN:
			return {
				...state,
				tm: action.payload.data.lang,
			};
		default:
			return state;
	}
};
