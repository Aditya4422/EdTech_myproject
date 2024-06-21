import { useEffect } from "react";

// This hook will detect the click outside the component and calls the provided handler function
export default function useOnClickOutside (ref, handler) {
    useEffect( () => {
        // lets define the listener function to be called on click/touch events
        const listener = (event) => {
            if(!ref.current || ref.current.contains(event.target)){  // if the click event is originated inside the ref element, do nothing
                return;
            }
            handler(event); //call the provided handler function
        };

        // add the event listeners for mousedown and touchstart event on the document
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        // cleanup function to remove the event listener when the component unmounts or when the ref/handler dependencies change
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };

    }, [ref, handler]);  // this effect will run only when the ref or handler function changes
}
