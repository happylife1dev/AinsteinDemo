using System.Web.Mvc;
using AinsteinDemo.Models;
using AinsteinDemo.Services;
using Microsoft.Rest;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Ajax.Utilities;
using AinsteinDemo.ActionFilters;


namespace AinsteinDemo.Controllers
{
    [LogActionFilter]
    public class ExchangeController : Controller
    {
        private string m_errorMessage;

        public ExchangeController()
        {
            m_errorMessage = ConfigValidatorService.GetWebConfigErrors();
        }

        private ErrorModel BuildErrorModel(string errorMessage)
        {
            return new ErrorModel
            {
                ErrorMessage = errorMessage
            };
        }

        // GET: Exchange | Index
        public ActionResult Index()
        {
            return View();
        }


        public async Task<ActionResult> Australia(int id)
        {
            if (!m_errorMessage.IsNullOrWhiteSpace())
            {
                return View("Error", BuildErrorModel(m_errorMessage));
            }

            try
            {
                System.Collections.Generic.IList<Guid> theReportList = new System.Collections.Generic.List<Guid>()
                {
                    ConfigValidatorService.AustraliaId
                };

                var embedResult = await EmbedService.GetEmbedParams(ConfigValidatorService.WorkspaceId, theReportList[0]);
                return View(embedResult);
            }
            catch (HttpOperationException exc)
            {
                m_errorMessage = string.Format("Status: {0} ({1})\r\nResponse: {2}\r\nRequestId: {3}", exc.Response.StatusCode, (int)exc.Response.StatusCode, exc.Response.Content, exc.Response.Headers["RequestId"].FirstOrDefault());
                return View("Error", m_errorMessage);
            }
            catch (Exception ex)
            {
                return View("Error", ex.Message);
            }
        }
    }
}
