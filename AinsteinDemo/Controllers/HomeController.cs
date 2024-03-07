using AinsteinDemo.Models;
using AinsteinDemo.Services;
using Microsoft.Rest;
using System;
using System.Configuration;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Web.Mvc;
using Microsoft.Ajax.Utilities;
using AinsteinDemo.ActionFilters;

namespace AinsteinDemo.Controllers
{
    [LogActionFilter]
    public class HomeController : Controller
    {
        private string m_errorMessage;

        public HomeController()
        {
            m_errorMessage = ConfigValidatorService.GetWebConfigErrors();
        }

        public ActionResult Index()
        {
            // Assembly info is not needed in production apps and the following 6 lines can be removed

            var result = new IndexConfig();
            var assembly = Assembly.GetExecutingAssembly().GetReferencedAssemblies().Where(n => n.Name.Equals("Microsoft.PowerBI.Api")).FirstOrDefault();
            if (assembly != null)
            {
                result.DotNetSDK = assembly.Version.ToString(3);
            }
            return View(result);
        }

        public async Task<ActionResult> EmbedReport(int id)
        {
            if (!m_errorMessage.IsNullOrWhiteSpace())
            {
                return View("Error", BuildErrorModel(m_errorMessage));
            }

            try
            {
                System.Collections.Generic.IList<Guid> theReportList = new System.Collections.Generic.List<Guid>();
                theReportList.Add(ConfigValidatorService.ReportId);
                theReportList.Add(ConfigValidatorService.AustraliaId);
                theReportList.Add(ConfigValidatorService.CheckupId);
                theReportList.Add(ConfigValidatorService.HiddenId);

                var embedResult = await EmbedService.GetEmbedParams(ConfigValidatorService.WorkspaceId, theReportList[id]);
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

        public async Task<ActionResult> EmbedDashboard()
        {
            if (!m_errorMessage.IsNullOrWhiteSpace())
            {
                return View("Error", BuildErrorModel(m_errorMessage));
            }

            try
            {
                var embedResult = await EmbedService.EmbedDashboard(new Guid(ConfigurationManager.AppSettings["workspaceId"]));
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

        public async Task<ActionResult> EmbedTile()
        {
            if (!m_errorMessage.IsNullOrWhiteSpace())
            {
                return View("Error", BuildErrorModel(m_errorMessage));
            }

            try
            {
                var embedResult = await EmbedService.EmbedTile(new Guid(ConfigurationManager.AppSettings["workspaceId"]));
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

        private ErrorModel BuildErrorModel(string errorMessage)
        {
            return new ErrorModel
            {
                ErrorMessage = errorMessage
            };
        }
    }
}
