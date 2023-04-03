import jsdom from 'jsdom';
import Logger from './logger';

const logger = Logger.create('DOC_HTML_LIB');

const data = `
<form action="/dang-nhap" class="" method="post">
  <input
    name="__RequestVerificationToken"
    type="hidden"
    value="RN9D20-JERYUfEWW3g7qYaV8W-qfiP3MN3R5xmqm5oMgc_GYC_i1MsSfjL3qzG7Z8TMjV7b6Mk1F7phWa63kjRXnD_01"
  />
  <div class="box bordered-box blue-border box-nomargin">
    Nothing here
  </div>
  </form>


`;

const { JSDOM } = jsdom;

const getTokenFromHtml = (str = data): any => {
  const dom = new JSDOM((str || '').toString());
  const docs = dom.window.document;
  const result: NodeListOf<HTMLElement> = docs.getElementsByName('__RequestVerificationToken');

  // try {
  //   logger.info(docs);
  //   logger.info(
  //     '__RequestVerificationToken: ',
  //     docs.querySelector('[name=__RequestVerificationToken]').getAttribute('value'),
  //   );
  //   // logger.info(str);
  // } catch (err) {
  //   logger.error(err.message);
  // }

  return result[0]?.getAttribute('value');
};

export {
  // eslint-disable-next-line import/prefer-default-export
  getTokenFromHtml,
};
