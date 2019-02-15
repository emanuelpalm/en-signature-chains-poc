import {LogBroker} from "../LogBroker";

export interface Action {
    name?: string,
    classNames?: string[],
    run: () => void,
}

export namespace Action {
    export function appendHTMLMenu(
        $root: HTMLElement,
        $button: HTMLElement,
        ...actions: Action[]
    )
    {
        let onClickOutside: ((event: Event) => void) | undefined;
        const close = () => {
            $root.classList.remove("selected");
            if (onClickOutside !== undefined) {
                window.removeEventListener("click", onClickOutside);
            }
        };
        $button.onclick = () => {
            if ($root.classList.contains("edit")) {
                $root.classList.remove("selected");
                return;
            }
            if (onClickOutside !== undefined) {
                window.removeEventListener("click", onClickOutside);
            }
            if ($root.classList.toggle("selected")) {
                setTimeout(() => window.addEventListener(
                    "click", onClickOutside = () => close()));
            }
        };

        const $menu = document.createElement("div");
        $menu.classList.add("menu");
        for (const action of actions) {
            const $item = document.createElement("span");
            if (action.classNames !== undefined) {
                $item.classList.add(...action.classNames);
            }
            if (action.name !== undefined) {
                $item.textContent = action.name;
            }
            $item.onclick = () => {
                try {
                    action.run();
                }
                catch (error) {
                    LogBroker.instance()
                        .publish({title: "Token Expression Error", data: error});
                }
            };
            $menu.appendChild($item);
        }
        $root.appendChild($menu);
    }
}