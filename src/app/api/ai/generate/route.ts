import { NextResponse } from 'next/server';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getAiResponse = (name: string, category: string) => {
  let description = '';
  let tags: string[] = [];

  const genericName = name || '신상품';

  switch (category) {
    case '패션의류':
      description = `트렌디한 감성과 편안함을 동시에 잡은 ${genericName}입니다. 고급스러운 소재와 꼼꼼한 마감 처리로 데일리룩부터 특별한 날까지 완벽하게 연출할 수 있습니다. 체형을 자연스럽게 커버해주는 세련된 핏으로 어떤 아이템과 매치해도 멋스러운 스타일링이 가능합니다. 올 시즌 필수 아이템으로 추천해 드립니다.`;
      tags = ['데일리룩', 'OOTD', '패션스타그램', '신상', '여름코디', 'MD추천'];
      break;
    case '가전·디지털':
      description = `혁신적인 기술력이 집약된 ${genericName}을 만나보세요. 사용자 중심의 직관적인 인터페이스와 강력한 성능으로 일상의 편리함을 극대화합니다. 미니멀하고 세련된 디자인은 집안 어느 곳에 두어도 인테리어 오브제로 손색이 없습니다. 스마트한 라이프스타일을 위한 최고의 선택입니다.`;
      tags = ['얼리어답터', '테크기기', '스마트홈', '가전제품추천', '신상리뷰'];
      break;
    case '식품·건강':
      description = `엄선된 프리미엄 원재료만으로 정성껏 만든 ${genericName}입니다. 맛과 영양의 완벽한 밸런스를 고려하여 온 가족이 안심하고 즐길 수 있습니다. 바쁜 일상 속에서 간편하게 활력을 충전하세요. 소중한 분들을 위한 품격 있는 선물용으로도 적극 추천합니다.`;
      tags = ['건강식품', '웰빙', '건강관리', '선물추천', '영양만점'];
      break;
    case '뷰티·향수':
      description = `당신의 본연의 아름다움을 깨워줄 ${genericName}. 피부 깊숙이 스며드는 차원이 다른 수분감과 영양으로 하루 종일 빛나는 광채 피부를 선사합니다. 민감성 피부도 안심하고 사용할 수 있는 순한 성분과 은은하게 남는 고급스러운 향기가 매력적입니다.`;
      tags = ['코덕', '뷰티스타그램', '스킨케어', '인생템', '피부관리'];
      break;
    case '홈·리빙':
      description = `나만의 공간을 더욱 특별하게 만들어줄 ${genericName}입니다. 실용성과 감성적인 디자인을 모두 충족하는 프리미엄 리빙 아이템으로, 집안의 분위기를 아늑하고 세련되게 바꿔줍니다. 내구성이 뛰어나 오랫동안 변함없이 사용할 수 있습니다.`;
      tags = ['집꾸미기', '인테리어소품', '홈스타일링', '랜선집들이', '감성인테리어'];
      break;
    case '스포츠·레저':
      description = `최상의 퍼포먼스를 끌어내기 위해 설계된 ${genericName}입니다. 인체공학적 디자인과 탁월한 내구성을 바탕으로 어떤 거친 환경에서도 완벽한 활동성을 보장합니다. 초보자부터 전문가까지 모두 만족할 수 있는 품질로 당신의 스포츠 라이프의 격을 높여보세요.`;
      tags = ['오운완', '스포츠용품', '아웃도어', '캠핑장비', '운동기록'];
      break;
    default:
      description = `이 계절에 가장 잘 어울리는 프리미엄 아이템, ${genericName}입니다. 최고급 퀄리티와 세련된 감성으로 고객님들의 많은 사랑을 받고 있습니다. 한정 수량으로 진행되니 지금 바로 만나보세요.`;
      tags = ['프리미엄', '한정판매', '인기상품', '추천템'];
  }

  return { description, tags };
};

export async function POST(request: Request) {
  try {
    const { name, category } = await request.json();
    
    // Simulate AI generation delay (2.5 seconds)
    await delay(2500);
    
    const generatedData = getAiResponse(name, category);
    
    return NextResponse.json(generatedData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate AI content' }, { status: 500 });
  }
}
