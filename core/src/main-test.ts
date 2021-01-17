import { resolve } from "path";
import { expect } from "chai";
import { readFile } from "fs-extra";
import remark from "remark";
import html from "remark-html";
import { toMd } from "./main";
import { A, Bold, Document, Heading, ListItem, P, Preformatted } from "./2md";
import { BlockRendering } from "./render";
import { parse } from "./parse-with-jsdom";

export async function fixtureBuffer(filename: string): Promise<Buffer> {
  const path = resolve(__dirname, "../fixtures", filename);
  const contents = await readFile(path);
  return contents;
}

export async function fixture(filename: string): Promise<string> {
  return (await fixtureBuffer(filename)).toString();
}

describe("2md", function() {
  describe("parsing", function() {
    it("handles text with no markup at all", function() {
      expect(toMd("foo")).to.eql("foo\n");
    });

    it("can parse the first sample", async function() {
      const html = await fixture("quote1.html");
      const expected = new Document([
        new Heading(["The end of 32-bit apps (and other removals)"], {
          level: 2
        }),

        new P([
          "Mac hardware and macOS made the jump from 32 bits to 64 bits a long" +
            " time ago, but Catalina will be the very first version of macOS" +
            " that is totally unable to run 32-bit software. For (what I hope will be) the last time, let's review the Mac's entire 64-bit timeline from start to finish:"
        ]),
        new ListItem([
          new Bold(["June 2003"]),
          ": The PowerPC G5 CPU is ",
          new A(["the first 64-bit-capable chip to show up in a Mac"], {
            href: "https://www.macworld.com/article/1025078/future.html"
          }),
          ", and with Mac OS X 10.3 Panther, it can theoretically address up to 8GB of RAM."
        ]),
        new ListItem([
          new Bold(["April 2005"]),
          ": Mac OS X 10.4 Tiger ",
          new A(["allows for 64-bit processes under the hood"], {
            href: "https://arstechnica.com/gadgets/2005/04/macosx-10-4/4/"
          }),
          "--they can be spun off from another process or run via the Terminal."
        ])
      ]);
      const parsed = parse(html);
      expect(parsed).to.deep.equal(expected);
    });

    it("turns <pre><code> into just a preformatted node", function() {
      const parsed = parse(`<pre><code>foo</code></pre>`);
      expect(parsed).to.deep.equal(new Document([new Preformatted(["foo"])]));
    });
  });

  describe("end-to-end", function() {
    for (let basename of [
      "bold-and-italic",
      "quote1",
      "quote2",
      "quote3",
      "single-br"
    ]) {
      it(`can process ${basename}.html to ${basename}.md`, async function() {
        const [html, md] = await Promise.all(
          ["html", "md"].map(ext => fixture(basename + "." + ext))
        );
        expect(toMd(html)).to.eql(md);
      });
    }
  });

  describe("round-trip", function() {
    function roundTripTest(filename: string) {
      it(`can round-trip ${filename}`, async function() {
        const md = await fixture(filename);
        const rendered = await remark()
          .use(html)
          .process(md);
        const backToMd = toMd(rendered.contents.toString());
        expect(backToMd).to.eql(md);
      });
    }

    for (let filename of [
      "README.md",
      "blockquote1.md",
      "headings-cant-wrap.md",
      "inline-code.md",
      "nested-lists.md",
      "round-trip-emoji.md",
      "round-trip1.md",
      "round-trip2.md",
      "round-trip3.md",
      "round-trip4.md",
      "too-long-code.md",
      "autolinks.md"
    ]) {
      roundTripTest(filename);
    }
  });

  describe("formatting", function() {
    it("strips out empty anchor elements", async function() {
      const anchorsHtml = await fixture("anchors.html");
      expect(toMd(anchorsHtml)).to.eql("# Hello, world.\n".repeat(2));
    });

    it("handles tt elements", function() {
      expect(toMd("<tt>foo</tt>")).to.eql("`foo`\n");
    });

    it("ignores links with empty hrefs", function() {
      expect(toMd("foo <a href=''>bar</a>")).to.eql("foo bar\n");
      expect(toMd("foo <a name='blah'>bar</a>")).to.eql("foo bar\n");
    });

    it("ignores links with no content", function() {
      expect(toMd("foo<a href=example.org></a>")).to.eql("foo\n");
    });

    it("wraps normal text", function() {
      expect(toMd("foo\nbar\nbaz\n")).to.eql("foo bar baz\n");
    });

    it("doesn’t crash on a br all by tiself", async function() {
      expect(toMd("<br>")).to.eql("");
    });

    it("turns two brs into a newline", async function() {
      expect(toMd(await fixture("two-br.html"))).to.eql("foo\n\nbar\n\nbaz\n");
    });
  });

  describe("--wrap-in-backquote", function() {
    it("works", function() {
      const intermediate = parse(`foo`, { quote: true });
      const rendering = new BlockRendering();
      intermediate.render(rendering);
      expect(rendering.finish()).to.eql(`> foo\n`);
    });

    it("includes trailers within the backquote", function() {
      const intermediate = parse("<a href=#top>Top</a>", { quote: true });
      const rendering = new BlockRendering();
      intermediate.render(rendering);
      expect(rendering.finish()).to.eql("> [Top][1]\n>\n> [1]: #top\n");
    });
  });
});
