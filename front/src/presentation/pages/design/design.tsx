import { Link, useParams } from "react-router"
import { paths } from "../../../routes"

export function DesignPage() {
    const { verification_id } = useParams<{ verification_id: string }>()

    return (
        <div>
            <h1>デザインページ</h1>
            <p>検証ID: {verification_id}</p>
            <Link to={paths.home()}>ホームへ戻る</Link>
        </div>
    )
}
