import * as React from "react"

export const Linea = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="20"
            fill="none"
            viewBox="0 0 30 32"
        >
            <g fill="#fff" clipPath="url(#clip0_1642_470)">
                <path d="M24.135 31.212H0V5.503h5.522V26.23h18.613v4.982zM24.135 10.483c2.72 0 4.926-2.23 4.926-4.98 0-2.75-2.205-4.98-4.926-4.98-2.72 0-4.926 2.23-4.926 4.98 0 2.75 2.206 4.98 4.926 4.98z"></path>
            </g>
            <defs>
                <clipPath id="clip0_1642_470">
                    <path
                        fill="#fff"
                        d="M0 0H29.061V30.689H0z"
                        transform="translate(0 .523)"
                    ></path>
                </clipPath>
            </defs>
        </svg>
    );
}

export default Linea;
