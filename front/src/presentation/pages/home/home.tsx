import { Link } from "react-router"
import { paths } from "../../../routes"

export function HomePage() {
    // TODO: バックエンドから検証ID一覧を取得する
    const sampleVerificationId = "sample-001"

    return (
        <div>
            <h1>ホーム</h1>
            <Link to={paths.design(sampleVerificationId)}>
                デザインページへ
            </Link>
        </div>
    )
}
