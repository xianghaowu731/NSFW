import { createTheme } from "@material-ui/core";

export default createTheme({
    overrides: {
        MuiButton: {
            disableElevation: true,
            outlinedPrimary: {
                border: "1px solid #FF5C01"
            },
            contained: {
                boxShadow: "none",
                "&:hover": {
                    boxShadow: "none"
                },
                "&:active": {
                    boxShadow: "none"
                }
            },
            containedPrimary: {
                color: "#fff"
            },
            sizeLarge: {
                maxWidth: "220px",
                width: "100%",
                height: "60px",
                fontSize: "24px"
            },
            sizeSmall: {
                maxWidth: "82px",
                width: "100%",
                height: "32px",
                fontSize: "15px"
            }
        },
        MuiTypography: {
            root: {
                fontFamily: 'Inter !important',
                color: 'red'
            }
        }
    },
    palette: {
        primary: {
            main: "#fb6c1c"
        },
        secondary: {
            main: "#131315"
        },
        text: {
            primary: "#fb6c1c",
            secondary: "#7a7a81"
        },
        border: {
            main: "#7a7a81",
            light: "#e9e9e9"
        },
        background: {
            main: "#b5b5b5"
        }
    },
    typography: {
        allVariants: {
            color: "#fff",
            // TODO: This not working
            fontFamily: "Inter"
        },
        // Why doesnt this work?? where is this .css-jb1ygz-MuiTypography-root class coming from???
        // It is applying "roboto" font and there is no mention of roboto in the project....
        // https://mui.com/customization/typography/#font-family
        fontFamily: "Inter",
        button: {
            textTransform: "none"
        },
        h1: {
            fontSize: "38px",
            lineHeight: "48px",
            fontWeight: 600,
            "@media (max-width: 960px)": {
                fontSize: "28px"
            }
        },
        h2: {
            fontSize: "24px",
            lineHeight: "31px"
        },
        h3: {
            fontSize: "22px"
        },
        h4: {
            fontSize: "18px"
        },
        body1: {
            color: "#898EA2",
            fontSize: '16px',
            lineHeight: '28px',
            fontWeight: 400,
        },
        body2: {
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: 400,
            fontFamily: 'Inter'
            // "@media (max-width: 960px)": {
            //     fontSize: "14px"
            // }
        },
        caption: {
            fontSize: '13px',
            lineHeight: '16px',
            color: "#898EA2",
            fontWeight: 400,
            fontFamily: 'Inter'
        },
    },
});
