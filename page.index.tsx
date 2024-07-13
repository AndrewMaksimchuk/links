import { type FC } from 'hono/jsx'

export const Index: FC = () => {
    return (
        <form hx-post="/login" hx-target="this" hx-swap="outerHTML" hx-push-url="true" id="form-entrance"
            class="form-entrance">
            <fieldset>
                <legend style="font-size: 2rem; margin: auto;">Registration | Entrance</legend>

                <label for="tel">Phone number</label>
                <input type="tel" id="tel" name="telephone" title="Must containe only numbers" inputmode="tel"
                    pattern="[0-9]{10,13}" autocomplete="off" minlength={10} maxlength={13} placeholder="0665243347"
                    autofocus required />

                <label for="password">Password</label>
                <input type="password" id="password" name="password" inputmode="text" autocomplete="current-password"
                    minlength={10} title="Must be long, contain different symbols" placeholder="s8t!~RbR9i$^cK" required />

                <button type="submit">Log in</button>
            </fieldset>
        </form>
    );
}
