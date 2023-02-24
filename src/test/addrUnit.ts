import { log } from '../utils/gyConsole'
import Addr from '../api/core/common/Addr'

export default function test() {
    console.log(new Addr('/a/b/gy/'))
    console.log(new Addr('').toPathStr())// expected /
    console.log(new Addr('/').toPathStr())// expected /
    console.log(new Addr('/a/b/gy/').toPathStr())// expected /a/b/gy
    console.log(new Addr('a/b/gy').toPathStr())// expected /a/b/gy
    console.log(new Addr("").isRoot())
    console.log(new Addr("/a/a").isRoot())
    console.log(new Addr("/a/a").compareWith(new Addr("/a/b")))// f
    console.log(new Addr("/a/a").compareWith(new Addr("/a/a")))// t
    console.log(new Addr("/a/a/a").compareWith(new Addr("/a/a")))// f
    console.log(new Addr("/a/a").compareWith(new Addr("/b/a")))// f
    console.log(new Addr("").up())
    console.log(new Addr("init").down("a").down("b").down("c").down("d").down("e").down("f"))
    console.log(new Addr("").getTopToken())
    console.log(new Addr("a/b/c").getTopToken())
}
