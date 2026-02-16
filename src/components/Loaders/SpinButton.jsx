import React from 'react'

const SpinButton = ({loading,clickButton,text,className}) => {
    return (
        <div>
            <button
                onClick={clickButton}
                disabled={loading}
                className={`flex items-center justify-center gap-2 rounded-lg bg-green-500 cursor-pointer px-5 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70 ${className || ''}`}
            >
                {loading && <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                </svg>}
                <span>{text}</span>
            </button>
        </div>
    )
}

export default SpinButton
