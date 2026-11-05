import { generatePath } from "react-router"

// ルート定義（パスパターン）
// ":verification_id" のように ":" を付けた部分がパスパラメータになる
export const ROUTES = {
    home: "/",
    design: "/design/:verification_id",
    requirements: "/requirements/:verification_id",
} as const

// 遷移先URLを組み立てるヘルパー（Link / navigate で使う）
export const paths = {
    home: () => ROUTES.home,
    design: (verificationId: string) => generatePath(ROUTES.design, { verification_id: verificationId }),
    requirements: (verificationId: string) => generatePath(ROUTES.requirements, { verification_id: verificationId }),
}
