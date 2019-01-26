declare var process: {
    env: {
        NODE_ENV: string;
    },
};

declare const functionsCode: string;
declare const functionsHostname: string;

declare global {
    interface Window {
        onGoogleLogin?: Function;
   }
}

const serviceUrl = process.env.NODE_ENV === "development" ? "/" : `https://${functionsHostname}/`;

let easyAuthInfoToken: string;

function createButton(arg: "on" | "off", title: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.style.height = "100px";
    button.style.width = "200px";
    button.style.fontSize = "60px";
    button.textContent = title;
    button.addEventListener("click", async () => {
        const status = document.getElementById("status") as HTMLSpanElement;
        status.textContent = `Schalte Maschine ${title.toLocaleLowerCase()}`;
        try {
            const res = await fetch(`${serviceUrl}api/switch?${arg}=1&code=${functionsCode}`, {method: "POST", headers: {"X-ZUMO-AUTH": easyAuthInfoToken}});
            status.textContent = res.ok ?
                `Maschine ${title.toLocaleLowerCase()}` :
                `Fehler vom Service: ${await res.text()}`;
        } catch (err) {
            status.textContent = `Netzwerkfehler: ${err.message}`;
        }
    });
    return button;
}

async function warmUp(): Promise<void> {
    const status = document.getElementById("status")!;
    status.textContent = "Aufwärmen...";
    try {
        await fetch(`${serviceUrl}api/switch`);
        status.textContent = "Aufgewärmt";
    } catch {
        status.textContent = "Fehler beim Aufwärmen";
    }
}

function component() {
    const div = document.createElement("div");
    div.appendChild(createButton("on", "An"));
    div.appendChild(document.createElement("br"));
    div.appendChild(createButton("off", "Aus"));
    div.appendChild(document.createElement("br"));
    const span = document.createElement("span");
    span.id = "status";
    div.appendChild(span);

    return div;
}

async function translateAuthToken(provider: string, body: {id_token: string}) {
    // Call function app to translate provider token to easyAuthInfo
    const res = await fetch(`${serviceUrl}.auth/login/${provider}`, {method: "POST", body: JSON.stringify(body)})
    const resBody = await res.json();
    console.log(resBody);
    easyAuthInfoToken = resBody.authenticationToken;
}

async function callAuthMe() {
    const res = await fetch(`${serviceUrl}.auth/me`, {headers: {"X-ZUMO-AUTH": easyAuthInfoToken}});
    const resBody = await res.json()
    console.log(resBody);
}

export function init() {
    const googlesignin = document.createElement("div");
    googlesignin.className = "g-signin2";
    googlesignin.dataset.onsuccess = "onGoogleLogin";
    window.onGoogleLogin = async (googleUser: any)  => {
        console.log(googleUser.getAuthResponse());
        const id_token = googleUser.getAuthResponse().id_token;
        await translateAuthToken("google", { id_token });
        await callAuthMe();
    }
    document.body.appendChild(googlesignin);
    document.body.appendChild(component());
    warmUp();
}
