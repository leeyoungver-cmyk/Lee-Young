import type { Lang } from '@/app/page';

const ko = (
  <>
    <p>
      <strong className="font-semibold text-ink">이영(b.2000)</strong>은 현실이라고 부르는 장면이 어떤 조건 속에서 만들어지고 유지되는지를
      의심하는 것에서 작업을 시작한다. 오늘날 이미지는 기록, 증거, 경험의 대리물로
      기능하지만, 동시에 그 신뢰를 가장 쉽게 붕괴시키는 매체이기도 하다. 뉴스,
      다큐멘터리, 기록 영상과 같이 사실을 전제하던 형식들 또한, 그것이 실제인지
      생성된 것인지 구분하기 어려운 상태에 놓여 있다.
    </p>
    <p>
      작업에서는 이러한 조건을 <strong className="font-semibold text-ink">'메타-멘터리(Meta-Mentary)'</strong>이라는 개념으로 다루고자 한다.
      이는 사실과 허구를 구분하기 어려운 장면들에서 출발하며, 현실에서 비롯된 이미지와
      가상에서 생성된 이미지가 서로의 근거로 작동하는 상태를 포함한다. 이 과정에서
      단일한 현실의 기준은 더 이상 고정되지 않는다.
    </p>
    <p>
      작업은 이러한 이미지들을 공간으로 전환하는 방식으로 진행된다. 생성형 이미지,
      기록 영상, 개인적 기억, 물리적 조형물은 하나의 출처로 수렴되지 않은 채 병치되며,
      동일한 대상은 서로 다른 형태로 반복된다. 시간과 매체는 분리되지 않고 중첩되며,
      장면은 하나의 서사로 정리되지 않는다.
    </p>
    <p>
      이때 작업에서 중요한 것은 무엇이 실제인가에 대한 판단이 아니라, 어떤 조건에서
      장면이 실제처럼 작동하는가에 대한 문제이다. 완전한 재현보다는 어긋남과 불일치가
      드러나는 방식으로 장면을 구성한다. 분절된 이미지와 변형된 사물, 서로 다른
      시간의 레이어는 동일한 기준으로 정리되지 않으며, 현실을 구성하는 방식 자체를
      불안정한 상태로 드러낸다.
    </p>
    <p className="pt-2">
      <strong className="font-semibold text-ink">우리는 지금 무엇을 보고 있으며, 그 장면을 현실이라고 믿게 만드는 조건은 무엇인가?</strong>
    </p>
  </>
);

const en = (
  <>
    <p>
      <strong className="font-semibold text-ink">Lee Young (b. 2000)</strong> begins her practice by questioning
      the conditions under which what we call 'reality' is constructed and sustained.
      Today, images function as proxies for record, evidence, and experience—while
      simultaneously being the medium most capable of collapsing that trust. Formats
      once premised on fact, such as news broadcasts, documentaries, and archival footage,
      have entered a state in which it is increasingly difficult to distinguish the actual
      from the generated.
    </p>
    <p>
      Her work approaches these conditions through the concept of{' '}
      <strong className="font-semibold text-ink">'Meta-Mentary'</strong>: a term that departs from scenes where truth
      and fiction resist differentiation, encompassing states in which images derived from
      reality and images generated from the virtual each serve as grounds for the other.
      Within this process, any singular standard of reality ceases to be fixed.
    </p>
    <p>
      The work proceeds by translating such images into spatial form. Generative images,
      documentary footage, personal memory, and physical objects are juxtaposed without
      converging on a single origin; the same subject recurs in different forms. Time and
      medium do not separate but overlap, and scenes resist resolution into a single
      narrative.
    </p>
    <p>
      What becomes important is not a judgment of what is real, but the question of the
      conditions under which a scene operates as real. Rather than complete representation,
      scenes are composed to foreground discontinuity and incongruity. Fragmented images,
      transformed objects, and layers from different times resist organization under a
      single standard—exposing the very process of constructing reality as something
      unstable.
    </p>
    <p className="pt-2">
      <strong className="font-semibold text-ink">What are we looking at right now—and what are the conditions that make us believe that scene is real?</strong>
    </p>
  </>
);

export default function TextSection({ lang = 'ko' }: { lang?: Lang }) {
  return (
    <div className="px-8 md:px-14 lg:px-20 py-16 md:py-24 max-w-3xl">
      <SectionHeader title="Text" />
      <div className="mt-14 text-[15px] md:text-[17px] leading-[1.88] text-ink/88 space-y-7">
        {lang === 'en' ? en : ko}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-[11px] tracking-wider3 uppercase text-muted">{title}</h2>
  );
}
