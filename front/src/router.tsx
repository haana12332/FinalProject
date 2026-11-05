import { createBrowserRouter } from "react-router"

import { ROUTES } from "./routes"
import { HomePage, DesignPage } from "./presentation/pages"

export const router = createBrowserRouter([
    { path: ROUTES.home, element: <HomePage /> },
    { path: ROUTES.design, element: <DesignPage /> },
])
